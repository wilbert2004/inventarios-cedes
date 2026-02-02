const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * ========================================
 * MÓDULO DE REGISTRO Y RESGUARDO DE PRODUCTOS
 * Sistema de Gestión de Ciclo de Vida Completo
 * ========================================
 * 
 * Este módulo NO maneja ventas ni stock comercial.
 * Registra todo el ciclo de vida del producto con historial inmutable.
 * 
 * Estados: EN_TRANSITO → EN_RESGUARDO → BAJA_DEFINITIVA
 * 
 * Historial inmutable con tipos de eventos:
 * - registro, entrega, recepcion_chofer, recepcion_almacen, cambio_estado, baja, actualizacion
 */

// ========================================
// UTILIDADES
// ========================================

/**
 * Registrar evento en historial (inmutable)
 */
function registrarEvento(productId, tipoEvento, descripcion, datos = {}) {
    const insertEvent = db.prepare(`
    INSERT INTO custody_product_history 
    (product_id, tipo_evento, descripcion, previous_status, new_status, datos_json, changed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    insertEvent.run(
        productId,
        tipoEvento,
        descripcion,
        datos.previousStatus || null,
        datos.newStatus || null,
        datos.json ? JSON.stringify(datos.json) : null,
        datos.changedBy || null
    );
}

/**
 * Validar transición de estado
 */
function validarTransicionEstado(estadoActual, nuevoEstado) {
    const transiciones = {
        'EN_TRANSITO': ['EN_RESGUARDO', 'BAJA_DEFINITIVA'],
        'EN_RESGUARDO': ['BAJA_DEFINITIVA'],
        'BAJA_DEFINITIVA': [] // Estado final - no permite cambios
    };

    const permitidas = transiciones[estadoActual] || [];
    return permitidas.includes(nuevoEstado);
}

// ========================================
// HANDLERS IPC
// ========================================

/**
 * Registrar nuevo producto en el sistema
 * Estado inicial: EN_TRANSITO
 */
ipcMain.handle("custodyLifecycle:register", async (event, productData) => {
    try {
        const result = db.transaction(() => {
            // Validar número de inventario único
            const existing = db.prepare(
                "SELECT id FROM custody_products WHERE inventory_number = ? AND is_deleted = 0"
            ).get(productData.inventory_number);

            if (existing) {
                throw new Error(`El número de inventario ${productData.inventory_number} ya existe`);
            }

            // Validar número de serie único (si existe y no es N/C)
            if (productData.serial_number && productData.serial_number !== 'N/C' && productData.serial_number.trim() !== '') {
                const existingSerial = db.prepare(
                    "SELECT id FROM custody_products WHERE serial_number = ? AND is_deleted = 0"
                ).get(productData.serial_number);

                if (existingSerial) {
                    throw new Error(`El número de serie ${productData.serial_number} ya existe`);
                }
            }

            // Insertar producto con estado inicial EN_TRANSITO
            const insert = db.prepare(`
        INSERT INTO custody_products (
          inventory_number, serial_number, description, brand, model, quantity,
          reason, product_status, reference_folio, center_origin, notes,
          entregado_por_centro_trabajo, fecha_entrega, registered_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

            const info = insert.run(
                productData.inventory_number,
                productData.serial_number || null,
                productData.description,
                productData.brand || null,
                productData.model || null,
                productData.quantity || 1,
                productData.reason || 'RESGUARDO',
                'EN_TRANSITO', // Estado inicial siempre
                productData.reference_folio || null,
                productData.center_origin || null,
                productData.notes || null,
                productData.entregado_por_centro_trabajo,
                productData.fecha_entrega,
                productData.userId
            );

            const productId = info.lastInsertRowid;

            // Registrar evento de registro
            registrarEvento(
                productId,
                'registro',
                `Producto registrado: ${productData.inventory_number} - ${productData.description}`,
                {
                    newStatus: 'EN_TRANSITO',
                    changedBy: productData.userId,
                    json: {
                        inventory_number: productData.inventory_number,
                        center_origin: productData.center_origin,
                        reason: productData.reason
                    }
                }
            );

            // Registrar evento de entrega
            registrarEvento(
                productId,
                'entrega',
                `Entregado por: ${productData.entregado_por_centro_trabajo} el ${productData.fecha_entrega}`,
                {
                    changedBy: productData.userId,
                    json: {
                        entregado_por: productData.entregado_por_centro_trabajo,
                        fecha: productData.fecha_entrega,
                        centro_origen: productData.center_origin
                    }
                }
            );

            return { productId, status: 'EN_TRANSITO' };
        })();

        return { success: true, data: result };
    } catch (error) {
        console.error("Error registrando producto:", error);
        throw new Error(error.message || "Error al registrar producto");
    }
});

/**
 * Registrar recepción por chofer (opcional)
 */
ipcMain.handle("custodyLifecycle:registerDriverReception", async (event, data) => {
    try {
        const result = db.transaction(() => {
            // Obtener producto
            const product = db.prepare(
                "SELECT * FROM custody_products WHERE id = ? AND is_deleted = 0"
            ).get(data.productId);

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            if (product.product_status === 'BAJA_DEFINITIVA') {
                throw new Error("No se puede modificar un producto dado de baja");
            }

            // Actualizar datos de recepción chofer
            db.prepare(`
        UPDATE custody_products 
        SET recibido_por_chofer = ?, fecha_recepcion_chofer = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(data.recibido_por_chofer, data.fecha_recepcion_chofer, data.productId);

            // Registrar evento
            registrarEvento(
                data.productId,
                'recepcion_chofer',
                `Recibido por chofer: ${data.recibido_por_chofer} el ${data.fecha_recepcion_chofer}`,
                {
                    changedBy: data.userId,
                    json: {
                        recibido_por: data.recibido_por_chofer,
                        fecha: data.fecha_recepcion_chofer
                    }
                }
            );

            return { success: true };
        })();

        return result;
    } catch (error) {
        console.error("Error registrando recepción chofer:", error);
        throw new Error(error.message || "Error al registrar recepción por chofer");
    }
});

/**
 * Registrar recepción en almacén (obligatoria para EN_RESGUARDO)
 */
ipcMain.handle("custodyLifecycle:registerWarehouseReception", async (event, data) => {
    try {
        const result = db.transaction(() => {
            // Obtener producto
            const product = db.prepare(
                "SELECT * FROM custody_products WHERE id = ? AND is_deleted = 0"
            ).get(data.productId);

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            if (product.product_status === 'BAJA_DEFINITIVA') {
                throw new Error("No se puede modificar un producto dado de baja");
            }

            // Actualizar datos de recepción almacén
            db.prepare(`
        UPDATE custody_products 
        SET recibido_por_almacen = ?, fecha_recepcion_almacen = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(data.recibido_por_almacen, data.fecha_recepcion_almacen, data.productId);

            // Registrar evento
            registrarEvento(
                data.productId,
                'recepcion_almacen',
                `Recibido en almacén por: ${data.recibido_por_almacen} el ${data.fecha_recepcion_almacen}`,
                {
                    changedBy: data.userId,
                    json: {
                        recibido_por: data.recibido_por_almacen,
                        fecha: data.fecha_recepcion_almacen
                    }
                }
            );

            return { success: true };
        })();

        return result;
    } catch (error) {
        console.error("Error registrando recepción almacén:", error);
        throw new Error(error.message || "Error al registrar recepción en almacén");
    }
});

/**
 * Cambiar estado del producto con validaciones
 */
ipcMain.handle("custodyLifecycle:changeStatus", async (event, data) => {
    try {
        const result = db.transaction(() => {
            // Obtener producto actual
            const product = db.prepare(
                "SELECT * FROM custody_products WHERE id = ? AND is_deleted = 0"
            ).get(data.productId);

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            const estadoActual = product.product_status;
            const nuevoEstado = data.newStatus;

            // Validar que no esté en BAJA_DEFINITIVA
            if (estadoActual === 'BAJA_DEFINITIVA') {
                throw new Error("No se puede cambiar el estado de un producto dado de baja definitiva");
            }

            // Validar transición
            if (!validarTransicionEstado(estadoActual, nuevoEstado)) {
                throw new Error(`Transición de estado no permitida: ${estadoActual} → ${nuevoEstado}`);
            }

            // Validar requisitos para EN_RESGUARDO
            if (nuevoEstado === 'EN_RESGUARDO') {
                if (!product.recibido_por_almacen || !product.fecha_recepcion_almacen) {
                    throw new Error("Debe registrar la recepción en almacén antes de cambiar a EN_RESGUARDO");
                }
            }

            // Actualizar estado
            db.prepare(`
        UPDATE custody_products 
        SET product_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(nuevoEstado, data.productId);

            // Registrar evento
            registrarEvento(
                data.productId,
                'cambio_estado',
                data.reason || `Cambio de estado: ${estadoActual} → ${nuevoEstado}`,
                {
                    previousStatus: estadoActual,
                    newStatus: nuevoEstado,
                    changedBy: data.userId,
                    json: { motivo: data.reason }
                }
            );

            return { success: true, previousStatus: estadoActual, newStatus: nuevoEstado };
        })();

        return result;
    } catch (error) {
        console.error("Error cambiando estado:", error);
        throw new Error(error.message || "Error al cambiar estado del producto");
    }
});

/**
 * Dar de baja definitiva (cierre de ciclo de vida)
 */
ipcMain.handle("custodyLifecycle:deactivate", async (event, data) => {
    try {
        const result = db.transaction(() => {
            // Obtener producto
            const product = db.prepare(
                "SELECT * FROM custody_products WHERE id = ? AND is_deleted = 0"
            ).get(data.productId);

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            if (product.product_status === 'BAJA_DEFINITIVA') {
                throw new Error("El producto ya está dado de baja");
            }

            const estadoPrevio = product.product_status;
            const fechaBaja = new Date().toISOString().split('T')[0];

            // Actualizar a BAJA_DEFINITIVA
            db.prepare(`
        UPDATE custody_products 
        SET 
          product_status = 'BAJA_DEFINITIVA',
          fecha_baja = ?,
          motivo_baja = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(fechaBaja, data.motivo, data.productId);

            // Registrar evento de baja
            registrarEvento(
                data.productId,
                'baja',
                `Producto dado de baja definitiva. Motivo: ${data.motivo}`,
                {
                    previousStatus: estadoPrevio,
                    newStatus: 'BAJA_DEFINITIVA',
                    changedBy: data.userId,
                    json: {
                        motivo: data.motivo,
                        fecha_baja: fechaBaja,
                        estado_previo: estadoPrevio
                    }
                }
            );

            return { success: true, fecha_baja: fechaBaja };
        })();

        return result;
    } catch (error) {
        console.error("Error dando de baja producto:", error);
        throw new Error(error.message || "Error al dar de baja el producto");
    }
});

/**
 * Actualizar datos del producto (solo si NO está en BAJA_DEFINITIVA)
 */
ipcMain.handle("custodyLifecycle:update", async (event, data) => {
    try {
        const result = db.transaction(() => {
            // Obtener producto
            const product = db.prepare(
                "SELECT * FROM custody_products WHERE id = ? AND is_deleted = 0"
            ).get(data.productId);

            if (!product) {
                throw new Error("Producto no encontrado");
            }

            if (product.product_status === 'BAJA_DEFINITIVA') {
                throw new Error("No se puede modificar un producto dado de baja definitiva");
            }

            // No permitir cambiar número de inventario
            if (data.inventory_number && data.inventory_number !== product.inventory_number) {
                throw new Error("No se puede modificar el número de inventario");
            }

            // Campos actualizables
            const updates = [];
            const params = [];

            if (data.description !== undefined) {
                updates.push("description = ?");
                params.push(data.description);
            }
            if (data.brand !== undefined) {
                updates.push("brand = ?");
                params.push(data.brand);
            }
            if (data.model !== undefined) {
                updates.push("model = ?");
                params.push(data.model);
            }
            if (data.quantity !== undefined) {
                updates.push("quantity = ?");
                params.push(data.quantity);
            }
            if (data.notes !== undefined) {
                updates.push("notes = ?");
                params.push(data.notes);
            }
            if (data.reference_folio !== undefined) {
                updates.push("reference_folio = ?");
                params.push(data.reference_folio);
            }

            if (updates.length === 0) {
                throw new Error("No hay datos para actualizar");
            }

            updates.push("updated_at = CURRENT_TIMESTAMP");
            params.push(data.productId);

            const query = `UPDATE custody_products SET ${updates.join(", ")} WHERE id = ?`;
            db.prepare(query).run(...params);

            // Registrar evento de actualización
            registrarEvento(
                data.productId,
                'actualizacion',
                `Producto actualizado`,
                {
                    changedBy: data.userId,
                    json: { campos_actualizados: Object.keys(data).filter(k => k !== 'productId' && k !== 'userId') }
                }
            );

            return { success: true };
        })();

        return result;
    } catch (error) {
        console.error("Error actualizando producto:", error);
        throw new Error(error.message || "Error al actualizar producto");
    }
});

/**
 * Obtener todos los productos (excluye eliminados lógicamente)
 */
ipcMain.handle("custodyLifecycle:getAll", async (event, filters = {}) => {
    try {
        let query = `
      SELECT 
        cp.*,
        u.name as registered_by_name
      FROM custody_products cp
      LEFT JOIN users u ON cp.registered_by = u.id
      WHERE cp.is_deleted = 0
    `;

        const params = [];

        // Filtros
        if (filters.status) {
            query += ` AND cp.product_status = ?`;
            params.push(filters.status);
        }

        if (filters.reason) {
            query += ` AND cp.reason = ?`;
            params.push(filters.reason);
        }

        if (filters.search) {
            query += ` AND (cp.inventory_number LIKE ? OR cp.description LIKE ? OR cp.serial_number LIKE ?)`;
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        query += ` ORDER BY cp.created_at DESC`;

        const products = db.prepare(query).all(...params);
        return products;
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        throw new Error("Error al obtener productos");
    }
});

/**
 * Obtener historial completo de un producto (inmutable - solo lectura)
 */
ipcMain.handle("custodyLifecycle:getHistory", async (event, productId) => {
    try {
        const history = db.prepare(`
      SELECT 
        cph.*,
        u.name as changed_by_name
      FROM custody_product_history cph
      LEFT JOIN users u ON cph.changed_by = u.id
      WHERE cph.product_id = ?
      ORDER BY cph.created_at ASC
    `).all(productId);

        return history;
    } catch (error) {
        console.error("Error obteniendo historial:", error);
        throw new Error("Error al obtener historial del producto");
    }
});

/**
 * Obtener estadísticas del sistema
 */
ipcMain.handle("custodyLifecycle:getStatistics", async () => {
    try {
        const stats = {
            total: 0,
            enTransito: 0,
            enResguardo: 0,
            bajaDefinitiva: 0,
            porMotivo: {
                BAJA: 0,
                RESGUARDO: 0,
                TRASLADO: 0
            }
        };

        // Total de productos activos
        const total = db.prepare("SELECT COUNT(*) as count FROM custody_products WHERE is_deleted = 0").get();
        stats.total = total.count;

        // Por estado
        const byStatus = db.prepare(`
      SELECT product_status, COUNT(*) as count 
      FROM custody_products 
      WHERE is_deleted = 0
      GROUP BY product_status
    `).all();

        byStatus.forEach(row => {
            if (row.product_status === 'EN_TRANSITO') stats.enTransito = row.count;
            if (row.product_status === 'EN_RESGUARDO') stats.enResguardo = row.count;
            if (row.product_status === 'BAJA_DEFINITIVA') stats.bajaDefinitiva = row.count;
        });

        // Por motivo
        const byReason = db.prepare(`
      SELECT reason, COUNT(*) as count 
      FROM custody_products 
      WHERE is_deleted = 0
      GROUP BY reason
    `).all();

        byReason.forEach(row => {
            stats.porMotivo[row.reason] = row.count;
        });

        return stats;
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error);
        throw new Error("Error al obtener estadísticas");
    }
});

console.log("✓ custody-lifecycle.ipc handlers registrados");
