const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * ========================================
 * MÓDULO DE SALIDA DE BIENES EN RESGUARDO
 * ========================================
 * 
 * Maneja las salidas definitivas de bienes en resguardo hacia Zona Principal.
 * NO es un préstamo - es un traslado definitivo.
 * 5. El bien NO regresa al área original.
 */

/**
 * Procesar salida de bienes en resguardo
 */
ipcMain.handle("custodyExit:process", async (event, exitData) => {
    try {
        const result = db.transaction(() => {
            // 1. Validar que el folio sea único
            const existingFolio = db
                .prepare("SELECT id FROM custody_exits WHERE folio = ?")
                .get(exitData.folio);

            if (existingFolio) {
                throw new Error(`El folio ${exitData.folio} ya existe`);
            }

            // 2. Crear registro de salida
            const insertExit = db.prepare(`
        INSERT INTO custody_exits (
          folio, exit_date, description, destination,
          delivered_by, delivered_by_position,
          transported_by, transported_by_license,
          received_by, received_by_position,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

            const exitInfo = insertExit.run(
                exitData.folio,
                exitData.exit_date,
                exitData.description || null,
                exitData.destination || "Zona Principal",
                exitData.deliveredBy,
                exitData.deliveredByPosition,
                exitData.transportedBy,
                exitData.transportedByLicense,
                exitData.receivedBy,
                exitData.receivedByPosition
            );

            const exitId = exitInfo.lastInsertRowid;

            // 3. Procesar cada item de salida
            const insertExitItem = db.prepare(`
        INSERT INTO custody_exit_items (
          custody_exit_id, custody_product_id
        ) VALUES (?, ?)
      `);

            const updateProductStatus = db.prepare(`
        UPDATE custody_products 
        SET product_status = 'TRASLADADO',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

            const insertHistory = db.prepare(`
        INSERT INTO custody_product_history (
          product_id, tipo_evento, descripcion, 
          previous_status, new_status, datos_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

            let processedItems = 0;

            for (const item of exitData.items) {
                // Validar que el producto exista y esté EN_RESGUARDO
                const product = db
                    .prepare(
                        "SELECT * FROM custody_products WHERE id = ? AND product_status = 'EN_RESGUARDO'"
                    )
                    .get(item.custodyProductId);

                if (!product) {
                    throw new Error(
                        `El bien N° ${item.inventory_number} no está disponible para salida`
                    );
                }

                // Crear relación salida-producto
                insertExitItem.run(exitId, item.custodyProductId);

                // Cambiar estado del producto a TRASLADADO
                updateProductStatus.run(item.custodyProductId);

                // Registrar en historial
                insertHistory.run(
                    item.custodyProductId,
                    "salida",
                    `Salida definitiva a ${exitData.destination} - Folio: ${exitData.folio}`,
                    "EN_RESGUARDO",
                    "TRASLADADO",
                    JSON.stringify({
                        exit_folio: exitData.folio,
                        destination: exitData.destination,
                        delivered_by: exitData.deliveredBy,
                        transported_by: exitData.transportedBy,
                        received_by: exitData.receivedBy,
                    })
                );

                processedItems++;
            }

            return {
                exitId,
                folio: exitData.folio,
                processedItems,
            };
        })(); // Ejecutar transacción

        return {
            success: true,
            folio: result.folio,
            processedItems: result.processedItems,
            message: `Salida procesada: ${result.processedItems} bien(es) trasladado(s)`,
        };
    } catch (error) {
        console.error("Error processing custody exit:", error);
        return {
            success: false,
            message: error.message || "Error al procesar salida de resguardo",
        };
    }
});

/**
 * Obtener todas las salidas de resguardo
 */
ipcMain.handle("custodyExit:getAll", async () => {
    try {
        const exits = db
            .prepare(
                `
      SELECT 
        e.*,
        COUNT(ei.id) as items_count
      FROM custody_exits e
      LEFT JOIN custody_exit_items ei ON e.id = ei.custody_exit_id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `
            )
            .all();

        return exits;
    } catch (error) {
        console.error("Error fetching custody exits:", error);
        throw new Error("Error al obtener salidas de resguardo");
    }
});

/**
 * Obtener una salida específica con sus items
 */
ipcMain.handle("custodyExit:getById", async (event, exitId) => {
    try {
        // Obtener datos de la salida
        const exit = db
            .prepare("SELECT * FROM custody_exits WHERE id = ?")
            .get(exitId);

        if (!exit) {
            throw new Error("Salida no encontrada");
        }

        // Obtener items de la salida
        const items = db
            .prepare(
                `
      SELECT 
        ei.*,
        cp.inventory_number,
        cp.description,
        cp.serial_number,
        cp.brand,
        cp.model,
        cp.quantity
      FROM custody_exit_items ei
      INNER JOIN custody_products cp ON ei.custody_product_id = cp.id
      WHERE ei.custody_exit_id = ?
    `
            )
            .all(exitId);

        return {
            ...exit,
            items,
        };
    } catch (error) {
        console.error("Error fetching custody exit:", error);
        throw new Error("Error al obtener salida de resguardo");
    }
});

/**
 * Validar que un folio sea único
 */
ipcMain.handle("custodyExit:checkFolioExists", async (event, folio) => {
    try {
        const result = db
            .prepare("SELECT id FROM custody_exits WHERE folio = ?")
            .get(folio);
        return !!result;
    } catch (error) {
        console.error("Error checking folio:", error);
        return false;
    }
});

/**
 * Generar siguiente folio automático
 * Formato: SAL-RSG-AÑO-### (ej. SAL-RSG-2026-001)
 * Es consecutivo por año
 */
ipcMain.handle("custodyExit:generateFolio", async () => {
    try {
        const currentYear = new Date().getFullYear();
        const prefix = `SAL-RSG-${currentYear}-`;

        // Buscar el último folio del año actual
        const lastFolio = db
            .prepare(`
                SELECT folio 
                FROM custody_exits 
                WHERE folio LIKE ? 
                ORDER BY folio DESC 
                LIMIT 1
            `)
            .get(`${prefix}%`);

        let nextNumber = 1;

        if (lastFolio) {
            // Extraer el número del último folio
            const matches = lastFolio.folio.match(/-([0-9]+)$/);
            if (matches) {
                nextNumber = parseInt(matches[1]) + 1;
            }
        }

        // Formatear con ceros a la izquierda (3 dígitos)
        const paddedNumber = String(nextNumber).padStart(3, '0');
        const newFolio = `${prefix}${paddedNumber}`;

        console.log(`Folio generado exitosamente: ${newFolio}`);
        return newFolio;
    } catch (error) {
        console.error("Error generating folio:", error);
        throw new Error("Error al generar folio automático");
    }
});

module.exports = {};
