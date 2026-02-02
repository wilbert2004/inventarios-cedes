const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * Validar que el número de inventario sea único
 */
const validateInventoryNumber = (inventoryNumber, excludeId = null) => {
    const query = excludeId
        ? `SELECT id FROM custody_products WHERE inventory_number = ? AND id != ?`
        : `SELECT id FROM custody_products WHERE inventory_number = ?`;

    const params = excludeId ? [inventoryNumber, excludeId] : [inventoryNumber];
    const result = db.prepare(query).get(...params);
    return !result;
};

/**
 * Validar que el número de serie sea único (si existe y no es N/C)
 */
const validateSerialNumber = (serialNumber, excludeId = null) => {
    if (!serialNumber || serialNumber === 'N/C' || serialNumber.trim() === '') return true; // El número de serie es opcional o es N/C

    const query = excludeId
        ? `SELECT id FROM custody_products WHERE serial_number = ? AND id != ? AND serial_number IS NOT NULL AND serial_number != 'N/C'`
        : `SELECT id FROM custody_products WHERE serial_number = ? AND serial_number IS NOT NULL AND serial_number != 'N/C'`;

    const params = excludeId ? [serialNumber, excludeId] : [serialNumber];
    const result = db.prepare(query).get(...params);
    return !result;
};

/**
 * Handler para obtener todos los productos en resguardo
 */
ipcMain.handle("custodyProducts:getAll", async () => {
    try {
        const stmt = db.prepare(`
      SELECT * FROM custody_products 
      ORDER BY created_at DESC
    `);
        return stmt.all();
    } catch (error) {
        console.error("Error fetching custody products:", error);
        throw new Error("Error al obtener productos en resguardo");
    }
});

/**
 * Handler para obtener un producto en resguardo por ID
 */
ipcMain.handle("custodyProducts:getById", async (event, id) => {
    try {
        const stmt = db.prepare(`
      SELECT * FROM custody_products 
      WHERE id = ?
    `);
        return stmt.get(id);
    } catch (error) {
        console.error("Error fetching custody product:", error);
        throw new Error("Error al obtener producto en resguardo");
    }
});

/**
 * Handler para crear un nuevo producto en resguardo
 */
ipcMain.handle("custodyProducts:create", async (event, product) => {
    try {
        // Validar que el número de inventario sea único
        if (!validateInventoryNumber(product.inventory_number)) {
            throw new Error("El número de inventario ya existe");
        }

        // Validar que el número de serie sea único (si se proporciona)
        if (product.serial_number && !validateSerialNumber(product.serial_number)) {
            throw new Error("El número de serie ya existe");
        }

        const insertStmt = db.prepare(`
      INSERT INTO custody_products (
        inventory_number,
        serial_number,
        description,
        brand,
        model,
        quantity,
        reason,
        product_status,
        reference_folio,
        center_origin,
        notes,
        entregado_por_centro_trabajo,
        fecha_entrega,
        recibido_por_chofer,
        fecha_recepcion_chofer,
        recibido_por_almacen,
        fecha_recepcion_almacen,
        registered_by,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

        const result = insertStmt.run(
            product.inventory_number,
            product.serial_number || null,
            product.description,
            product.brand || null,
            product.model || null,
            product.quantity || 1,
            product.reason || "RESGUARDO",
            "EN_TRANSITO", // Estado inicial siempre es EN_TRANSITO
            product.reference_folio || null,
            product.center_origin || null,
            product.notes || null,
            product.entregado_por_centro_trabajo || null,
            product.fecha_entrega || null,
            product.recibido_por_chofer || null,
            product.fecha_recepcion_chofer || null,
            product.recibido_por_almacen || null,
            product.fecha_recepcion_almacen || null,
            product.registered_by || null
        );

        // Obtener el producto completo desde la base de datos
        const selectStmt = db.prepare(`
      SELECT * FROM custody_products WHERE id = ?
    `);
        const createdProduct = selectStmt.get(result.lastInsertRowid);

        // Registrar en el historial
        const historyStmt = db.prepare(`
      INSERT INTO custody_product_history (
        product_id,
        previous_status,
        new_status,
        reason_change,
        changed_by,
        created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

        historyStmt.run(
            result.lastInsertRowid,
            null,
            "EN_TRANSITO",
            "Registro inicial de producto",
            product.registered_by || null
        );

        return createdProduct;
    } catch (error) {
        console.error("Error creating custody product:", error);
        throw new Error(error.message || "Error al crear producto en resguardo");
    }
});

/**
 * Handler para actualizar un producto en resguardo
 */
ipcMain.handle("custodyProducts:update", async (event, id, product) => {
    try {
        // Validar que el número de inventario sea único (excluyendo el producto actual)
        if (product.inventory_number && !validateInventoryNumber(product.inventory_number, id)) {
            throw new Error("El número de inventario ya existe");
        }

        // Validar que el número de serie sea único (excluyendo el producto actual)
        if (product.serial_number && !validateSerialNumber(product.serial_number, id)) {
            throw new Error("El número de serie ya existe");
        }

        const stmt = db.prepare(`
      UPDATE custody_products 
      SET 
        inventory_number = ?,
        serial_number = ?,
        description = ?,
        brand = ?,
        model = ?,
        quantity = ?,
        reason = ?,
        reference_folio = ?,
        center_origin = ?,
        notes = ?,
        entregado_por_centro_trabajo = ?,
        fecha_entrega = ?,
        recibido_por_chofer = ?,
        fecha_recepcion_chofer = ?,
        recibido_por_almacen = ?,
        fecha_recepcion_almacen = ?,
        updated_at = datetime('now')
      WHERE id = ?
    `);

        stmt.run(
            product.inventory_number,
            product.serial_number || null,
            product.description,
            product.brand || null,
            product.model || null,
            product.quantity || 1,
            product.reason || "RESGUARDO",
            product.reference_folio || null,
            product.center_origin || null,
            product.notes || null,
            product.entregado_por_centro_trabajo || null,
            product.fecha_entrega || null,
            product.recibido_por_chofer || null,
            product.fecha_recepcion_chofer || null,
            product.recibido_por_almacen || null,
            product.fecha_recepcion_almacen || null,
            id
        );

        // Obtener el producto actualizado
        const selectStmt = db.prepare(`
      SELECT * FROM custody_products WHERE id = ?
    `);

        return selectStmt.get(id);
    } catch (error) {
        console.error("Error updating custody product:", error);
        throw new Error(error.message || "Error al actualizar producto en resguardo");
    }
});

/**
 * Handler para cambiar el estado de un producto
 */
ipcMain.handle("custodyProducts:changeStatus", async (event, id, newStatus, reasonChange, changedBy, receptionData = {}) => {
    try {
        // Obtener el producto completo
        const selectStmt = db.prepare(`
      SELECT * FROM custody_products WHERE id = ?
    `);
        const product = selectStmt.get(id);

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        const previousStatus = product.product_status;

        // VALIDACIÓN CRÍTICA: No se puede cambiar a EN_RESGUARDO sin datos de recepción en almacén
        if (newStatus === "EN RESGUARDO") {
            const recibidoPorAlmacen = receptionData.recibido_por_almacen || product.recibido_por_almacen;
            const fechaRecepcionAlmacen = receptionData.fecha_recepcion_almacen || product.fecha_recepcion_almacen;

            if (!recibidoPorAlmacen || !fechaRecepcionAlmacen) {
                throw new Error("No se puede cambiar a EN RESGUARDO sin datos de recepción en almacén (persona y fecha)");
            }

            // Si se proporciona información de recepción, actualizar
            if (receptionData.recibido_por_almacen || receptionData.fecha_recepcion_almacen) {
                const updateReceptionStmt = db.prepare(`
          UPDATE custody_products 
          SET 
            recibido_por_almacen = ?,
            fecha_recepcion_almacen = ?,
            recibido_por_chofer = ?,
            fecha_recepcion_chofer = ?,
            product_status = ?,
            updated_at = datetime('now')
          WHERE id = ?
        `);
                updateReceptionStmt.run(
                    receptionData.recibido_por_almacen || product.recibido_por_almacen,
                    receptionData.fecha_recepcion_almacen || product.fecha_recepcion_almacen,
                    receptionData.recibido_por_chofer || product.recibido_por_chofer || null,
                    receptionData.fecha_recepcion_chofer || product.fecha_recepcion_chofer || null,
                    newStatus,
                    id
                );
            } else {
                // Solo actualizar el estado
                const updateStmt = db.prepare(`
          UPDATE custody_products 
          SET product_status = ?, updated_at = datetime('now')
          WHERE id = ?
        `);
                updateStmt.run(newStatus, id);
            }
        } else {
            // Para otros estados, solo actualizar el estado
            const updateStmt = db.prepare(`
        UPDATE custody_products 
        SET product_status = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
            updateStmt.run(newStatus, id);
        }

        // Registrar en el historial
        const historyStmt = db.prepare(`
      INSERT INTO custody_product_history (
        product_id,
        previous_status,
        new_status,
        reason_change,
        changed_by,
        created_at
      ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    `);

        historyStmt.run(
            id,
            previousStatus,
            newStatus,
            reasonChange || null,
            changedBy || null
        );

        // Obtener el producto actualizado
        const updatedProduct = db.prepare(`
      SELECT * FROM custody_products WHERE id = ?
    `).get(id);

        return updatedProduct;
    } catch (error) {
        console.error("Error changing product status:", error);
        throw new Error(error.message || "Error al cambiar estado del producto");
    }
});

/**
 * Handler para obtener el historial de un producto
 */
ipcMain.handle("custodyProducts:getHistory", async (event, productId) => {
    try {
        const stmt = db.prepare(`
      SELECT 
        h.*,
        u.name as changed_by_name
      FROM custody_product_history h
      LEFT JOIN users u ON h.changed_by = u.id
      WHERE h.product_id = ?
      ORDER BY h.created_at DESC
    `);
        return stmt.all(productId);
    } catch (error) {
        console.error("Error fetching product history:", error);
        throw new Error("Error al obtener historial del producto");
    }
});

/**
 * Handler para obtener productos filtrados por estado
 */
ipcMain.handle("custodyProducts:getByStatus", async (event, status) => {
    try {
        const stmt = db.prepare(`
      SELECT * FROM custody_products 
      WHERE product_status = ?
      ORDER BY created_at DESC
    `);
        return stmt.all(status);
    } catch (error) {
        console.error("Error fetching products by status:", error);
        throw new Error("Error al obtener productos por estado");
    }
});

/**
 * Handler para obtener productos filtrados por motivo
 */
ipcMain.handle("custodyProducts:getByReason", async (event, reason) => {
    try {
        const stmt = db.prepare(`
      SELECT * FROM custody_products 
      WHERE reason = ?
      ORDER BY created_at DESC
    `);
        return stmt.all(reason);
    } catch (error) {
        console.error("Error fetching products by reason:", error);
        throw new Error("Error al obtener productos por motivo");
    }
});

/**
 * Handler para obtener estadísticas de productos
 */
ipcMain.handle("custodyProducts:getStatistics", async () => {
    try {
        const stats = {};

        // Total de productos
        stats.totalProducts = db.prepare(`
      SELECT COUNT(*) as count FROM custody_products
    `).get().count;

        // Productos por estado
        stats.byStatus = db.prepare(`
      SELECT product_status, COUNT(*) as count FROM custody_products
      GROUP BY product_status
    `).all();

        // Productos por motivo
        stats.byReason = db.prepare(`
      SELECT reason, COUNT(*) as count FROM custody_products
      GROUP BY reason
    `).all();

        // Cantidad total en resguardo
        stats.totalQuantity = db.prepare(`
      SELECT SUM(quantity) as total FROM custody_products
    `).get().total || 0;

        return stats;
    } catch (error) {
        console.error("Error fetching statistics:", error);
        throw new Error("Error al obtener estadísticas");
    }
});

/**
 * Handler para buscar productos
 */
ipcMain.handle("custodyProducts:search", async (event, query) => {
    try {
        const searchTerm = `%${query}%`;
        const stmt = db.prepare(`
      SELECT * FROM custody_products 
      WHERE 
        inventory_number LIKE ?
        OR serial_number LIKE ?
        OR description LIKE ?
        OR brand LIKE ?
        OR model LIKE ?
      ORDER BY created_at DESC
    `);
        return stmt.all(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    } catch (error) {
        console.error("Error searching products:", error);
        throw new Error("Error al buscar productos");
    }
});

/**
 * Handler para eliminar un producto (soft delete)
 */
ipcMain.handle("custodyProducts:delete", async (event, id) => {
    try {
        // En lugar de eliminar, cambiar a estado "BAJA DEFINITIVA"
        const stmt = db.prepare(`
      UPDATE custody_products 
      SET product_status = 'BAJA DEFINITIVA', updated_at = datetime('now')
      WHERE id = ?
    `);
        stmt.run(id);

        // Registrar en historial
        const historyStmt = db.prepare(`
      INSERT INTO custody_product_history (
        product_id,
        previous_status,
        new_status,
        reason_change,
        created_at
      ) VALUES (?, (SELECT product_status FROM custody_products WHERE id = ?), 'BAJA DEFINITIVA', 'Eliminación del sistema', datetime('now'))
    `);
        historyStmt.run(id, id);

        return { success: true, message: "Producto marcado como baja definitiva" };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw new Error("Error al eliminar producto");
    }
});

/**
 * Handler para exportar productos a CSV
 */
ipcMain.handle("custodyProducts:export", async () => {
    try {
        const stmt = db.prepare(`
      SELECT 
        id,
        inventory_number,
        serial_number,
        description,
        brand,
        model,
        quantity,
        reason,
        product_status,
        reference_folio,
        center_origin,
        created_at,
        updated_at
      FROM custody_products 
      ORDER BY created_at DESC
    `);
        return stmt.all();
    } catch (error) {
        console.error("Error exporting products:", error);
        throw new Error("Error al exportar productos");
    }
});
