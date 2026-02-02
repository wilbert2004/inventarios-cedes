const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * Handler para registrar entrada de productos (recepción de mercancía)
 */
ipcMain.handle("inventory:productEntry", async (event, entryData) => {
  try {
    // Iniciar transacción
    const result = db.transaction(() => {
      // Crear registro de entrada en asset_entries
      const folio = entryData.folio || `ENT-${Date.now()}`;
      const provider = entryData.provider || 'N/A';
      const entry_date = entryData.entry_date || new Date().toISOString().split('T')[0];
      const description = entryData.description || '';
      const userId = entryData.userId || 1;

      // Verificar que el folio sea único
      const existingEntry = db.prepare("SELECT id FROM asset_entries WHERE folio = ?").get(folio);
      if (existingEntry) {
        throw new Error(`El folio ${folio} ya existe en el sistema`);
      }

      // Insertar entrada
      const insertEntry = db.prepare(`
        INSERT INTO asset_entries (folio, provider, entry_date, description, user_id)
        VALUES (?, ?, ?, ?, ?)
      `);

      const entryResult = insertEntry.run(folio, provider, entry_date, description, userId);
      const entryId = entryResult.lastInsertRowid;

      // Procesar items de la entrada
      const updateStock = db.prepare(`
        UPDATE products 
        SET stock = stock + ? 
        WHERE id = ?
      `);

      const insertMovement = db.prepare(`
        INSERT INTO inventory_movements (product_id, type, quantity, reference, user_id)
        VALUES (?, ?, ?, ?, ?)
      `);

      // Obtener información de productos para validar tipo_venta
      const getProductInfo = db.prepare(`
        SELECT id, name, tipo_venta 
        FROM products 
        WHERE id = ?
      `);

      const entriesProcessed = [];

      // Procesar cada producto de la entrada
      for (const item of entryData.items) {
        // Verificar tipo de venta del producto
        const product = getProductInfo.get(item.productId);

        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        // Bloquear entradas para productos PRECIO_LIBRE
        if (product.tipo_venta === 'PRECIO_LIBRE') {
          throw new Error(
            `Los productos de precio variable no manejan inventario. Producto: ${product.name}`
          );
        }

        // Actualizar stock
        updateStock.run(item.quantity, item.productId);

        // Registrar movimiento
        const movementResult = insertMovement.run(
          item.productId,
          "IN",
          item.quantity,
          `ENTRY:${folio}`,
          userId
        );

        entriesProcessed.push({
          movementId: movementResult.lastInsertRowid,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          condition: item.condition || 'GOOD',
        });
      }

      return {
        entryId,
        folio,
        provider,
        entry_date,
        entriesProcessed,
        totalItems: entryData.items.length,
        totalQuantity: entryData.items.reduce((sum, item) => sum + item.quantity, 0),
        timestamp: new Date().toISOString(),
      };
    })();

    return {
      success: true,
      entry: result,
    };
  } catch (error) {
    console.error("Error processing product entry:", error);
    throw new Error(error.message || "Error al registrar entrada de productos");
  }
});

/**
 * Handler para registrar salida de productos (extracción/venta de mercancía)
 */
ipcMain.handle("inventory:productExit", async (event, exitData) => {
  try {
    // Iniciar transacción
    const result = db.transaction(() => {
      // Crear registro de salida en asset_exits
      const folio = exitData.folio || `SAL-${Date.now()}`;
      const exit_date = exitData.exit_date || new Date().toISOString().split('T')[0];
      const reason = exitData.reason || 'OTRA';
      const description = exitData.description || '';
      const deliveredBy = exitData.deliveredBy || 'N/A';
      const receivedBy = exitData.receivedBy || 'N/A';
      const userId = exitData.userId || 1;

      // Verificar que el folio sea único
      const existingExit = db.prepare("SELECT id FROM asset_exits WHERE folio = ?").get(folio);
      if (existingExit) {
        throw new Error(`El folio ${folio} ya existe en el sistema`);
      }

      // Insertar salida
      const insertExit = db.prepare(`
        INSERT INTO asset_exits (folio, exit_date, reason, delivered_by, received_by, user_id, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const exitResult = insertExit.run(folio, exit_date, reason, deliveredBy, receivedBy, userId, description);
      const exitId = exitResult.lastInsertRowid;

      // Procesar items de la salida
      const updateStock = db.prepare(`
        UPDATE products 
        SET stock = stock - ? 
        WHERE id = ?
      `);

      const insertMovement = db.prepare(`
        INSERT INTO inventory_movements (product_id, type, quantity, reference, user_id)
        VALUES (?, ?, ?, ?, ?)
      `);

      // Obtener información de productos
      const getProductInfo = db.prepare(`
        SELECT id, name, stock, tipo_venta 
        FROM products 
        WHERE id = ?
      `);

      const exitsProcessed = [];

      // Procesar cada producto de la salida
      for (const item of exitData.items) {
        // Obtener información del producto
        const product = getProductInfo.get(item.productId);

        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        // Validar tipo de venta
        if (product.tipo_venta === 'PRECIO_LIBRE') {
          throw new Error(
            `Los productos de precio variable no manejan inventario. Producto: ${product.name}`
          );
        }

        // Validar que haya stock suficiente
        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`
          );
        }

        // Actualizar stock (decrementar)
        updateStock.run(item.quantity, item.productId);

        // Registrar movimiento
        const movementResult = insertMovement.run(
          item.productId,
          "OUT",
          item.quantity,
          `EXIT:${folio}`,
          userId
        );

        exitsProcessed.push({
          movementId: movementResult.lastInsertRowid,
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          stockBefore: product.stock,
          stockAfter: product.stock - item.quantity,
        });
      }

      return {
        exitId,
        folio,
        exit_date,
        reason,
        deliveredBy,
        receivedBy,
        exitsProcessed,
        totalItems: exitData.items.length,
        totalQuantity: exitData.items.reduce((sum, item) => sum + item.quantity, 0),
        timestamp: new Date().toISOString(),
      };
    })();

    return {
      success: true,
      folio: result.folio,
      exit: result,
    };
  } catch (error) {
    console.error("Error processing product exit:", error);
    throw new Error(error.message || "Error al registrar salida de productos");
  }
});

/**
 * Handler para obtener historial de movimientos de inventario
 */
ipcMain.handle("inventory:getMovements", async (event, filters = {}) => {
  try {
    let query = `
      SELECT 
        im.*, 
        p.name as product_name,
        p.barcode as product_barcode,
        u.name as user_name
      FROM inventory_movements im
      LEFT JOIN products p ON im.product_id = p.id
      LEFT JOIN users u ON im.user_id = u.id
      WHERE 1=1
    `;

    const params = [];

    // Filtros opcionales
    // tipo puede ser string o array de tipos
    if (filters.type) {
      if (Array.isArray(filters.type) && filters.type.length > 0) {
        const placeholders = filters.type.map(() => '?').join(',');
        query += ` AND im.type IN (${placeholders})`;
        params.push(...filters.type);
      } else {
        query += ` AND im.type = ?`;
        params.push(filters.type);
      }
    }

    if (filters.productId) {
      query += ` AND im.product_id = ?`;
      params.push(filters.productId);
    }

    // referencia (folio) parcial
    if (filters.reference) {
      query += ` AND im.reference LIKE ?`;
      params.push(`%${filters.reference}%`);
    }

    // búsqueda por nombre o código de barras
    if (filters.productQuery) {
      query += ` AND (p.name LIKE ? OR p.barcode LIKE ?)`;
      params.push(`%${filters.productQuery}%`, `%${filters.productQuery}%`);
    }

    // rango de fechas
    if (filters.startDate) {
      query += ` AND DATE(im.created_at) >= DATE(?)`;
      params.push(new Date(filters.startDate).toISOString().split('T')[0]);
    }
    if (filters.endDate) {
      query += ` AND DATE(im.created_at) <= DATE(?)`;
      params.push(new Date(filters.endDate).toISOString().split('T')[0]);
    }

    query += ` ORDER BY im.created_at DESC LIMIT ?`;
    params.push(filters.limit || 100);

    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    throw new Error("Error al obtener movimientos de inventario");
  }
});

