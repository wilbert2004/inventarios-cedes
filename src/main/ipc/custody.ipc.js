import { ipcMain } from "electron";
import db from "../db/index.js";

// Verificar si un folio ya existe
ipcMain.handle("custody:checkFolioExists", async (event, folio) => {
    try {
        const exists = db
            .prepare("SELECT id FROM custody_entries WHERE folio = ?")
            .get(folio);
        return { exists: !!exists };
    } catch (error) {
        console.error("Error checking folio:", error);
        throw error;
    }
});

// Crear nuevo resguardo
ipcMain.handle("custody:createCustodyEntry", async (event, payload) => {
    const {
        folio,
        origin,
        entryDate,
        responsibles,
        items,
    } = payload;

    try {
        // Iniciar transacción
        const insertEntry = db.prepare(`
      INSERT INTO custody_entries (
        folio,
        origin_plant_name,
        origin_plant_code,
        origin_address,
        origin_municipality,
        origin_zone,
        entry_date,
        delivered_by_name,
        delivered_by_position,
        transported_by_name,
        transported_by_license,
        received_by_name,
        received_by_position,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const insertItem = db.prepare(`
      INSERT INTO custody_items (
        custody_entry_id,
        quantity,
        inventory_number,
        description,
        brand,
        model,
        serial_number,
        reason,
        status,
        initial_condition,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        // Ejecutar dentro de una transacción
        const transaction = db.transaction(() => {
            // Insertar encabezado
            const entryResult = insertEntry.run(
                folio,
                origin.plantName,
                origin.plantCode || null,
                origin.address || null,
                origin.municipality || null,
                origin.zone || null,
                entryDate,
                responsibles.deliveredByName,
                responsibles.deliveredByPosition || null,
                responsibles.transportedByName,
                responsibles.transportedByLicense || null,
                responsibles.receivedByName,
                responsibles.receivedByPosition || null,
                "EN_RESGUARDO",
                new Date().toISOString()
            );

            const entryId = entryResult.lastInsertRowid;

            // Insertar items
            for (const item of items) {
                insertItem.run(
                    entryId,
                    item.quantity,
                    item.inventoryNumber,
                    item.description,
                    item.brand || null,
                    item.model || null,
                    item.serialNumber || null,
                    item.reason,
                    "EN_RESGUARDO",
                    item.initialCondition,
                    item.notes || null,
                    new Date().toISOString()
                );
            }

            return { entryId, folio };
        });

        const result = transaction();

        return {
            success: true,
            folio,
            entryId: result.entryId,
            message: `Resguardo ${folio} creado exitosamente`,
        };
    } catch (error) {
        console.error("Error creating custody entry:", error);
        return {
            success: false,
            message: error.message || "Error creando resguardo",
        };
    }
});

// Obtener resguardo por ID
ipcMain.handle("custody:getCustodyEntry", async (event, entryId) => {
    try {
        const entry = db
            .prepare("SELECT * FROM custody_entries WHERE id = ?")
            .get(entryId);

        if (!entry) {
            return { success: false, message: "Resguardo no encontrado" };
        }

        const items = db
            .prepare("SELECT * FROM custody_items WHERE custody_entry_id = ?")
            .all(entryId);

        return {
            success: true,
            data: { ...entry, items },
        };
    } catch (error) {
        console.error("Error getting custody entry:", error);
        return {
            success: false,
            message: error.message,
        };
    }
});

// Listar todos los resguardos
ipcMain.handle("custody:listCustodyEntries", async (event, filters = {}) => {
    try {
        let query = "SELECT * FROM custody_entries WHERE 1=1";
        const params = [];

        if (filters.status) {
            query += " AND status = ?";
            params.push(filters.status);
        }

        if (filters.startDate) {
            query += " AND DATE(entry_date) >= ?";
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += " AND DATE(entry_date) <= ?";
            params.push(filters.endDate);
        }

        if (filters.searchText) {
            query += " AND (folio LIKE ? OR origin_plant_name LIKE ?)";
            const search = `%${filters.searchText}%`;
            params.push(search, search);
        }

        query += " ORDER BY created_at DESC";

        const entries = db.prepare(query).all(...params);

        return {
            success: true,
            data: entries,
            total: entries.length,
        };
    } catch (error) {
        console.error("Error listing custody entries:", error);
        return {
            success: false,
            message: error.message,
        };
    }
});

// Cambiar estado de resguardo
ipcMain.handle("custody:updateStatus", async (event, entryId, newStatus) => {
    try {
        const result = db
            .prepare("UPDATE custody_entries SET status = ?, updated_at = ? WHERE id = ?")
            .run(newStatus, new Date().toISOString(), entryId);

        if (result.changes === 0) {
            return { success: false, message: "Resguardo no encontrado" };
        }

        return {
            success: true,
            message: `Estado actualizado a ${newStatus}`,
        };
    } catch (error) {
        console.error("Error updating custody status:", error);
        return {
            success: false,
            message: error.message,
        };
    }
});

// Eliminar resguardo (solo si está en estado EN_RESGUARDO)
ipcMain.handle("custody:deleteCustodyEntry", async (event, entryId) => {
    try {
        const entry = db
            .prepare("SELECT * FROM custody_entries WHERE id = ?")
            .get(entryId);

        if (!entry) {
            return { success: false, message: "Resguardo no encontrado" };
        }

        if (entry.status !== "EN_RESGUARDO") {
            return {
                success: false,
                message: `No se puede eliminar un resguardo en estado ${entry.status}`,
            };
        }

        const transaction = db.transaction(() => {
            // Eliminar items
            db.prepare("DELETE FROM asset_location_history WHERE custody_item_id IN (SELECT id FROM custody_items WHERE custody_entry_id = ?)")
                .run(entryId);

            db.prepare("DELETE FROM custody_items WHERE custody_entry_id = ?")
                .run(entryId);

            // Eliminar resguardo
            db.prepare("DELETE FROM custody_entries WHERE id = ?").run(entryId);
        });

        transaction();

        return {
            success: true,
            message: "Resguardo eliminado exitosamente",
        };
    } catch (error) {
        console.error("Error deleting custody entry:", error);
        return {
            success: false,
            message: error.message,
        };
    }
});
