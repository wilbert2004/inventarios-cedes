const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * Handler para crear una nueva venta
 * Proceso:
 * 1. Crea el registro de venta
 * 2. Crea los items de la venta
 * 3. Actualiza el stock de los productos
 * 4. Registra los movimientos de inventario
 * 5. Retorna datos para imprimir el ticket
 */
ipcMain.handle("sales:create", async (event, saleData) => {
  try {
    // Iniciar transacción
    const result = db.transaction(() => {
      // 1. Crear la venta
      const insertSale = db.prepare(`
        INSERT INTO sales (user_id, total, payment_method,created_at)
        VALUES (?, ?, ?,?)
      `);

      const saleResult = insertSale.run(
        saleData.userId || 1, // TODO: usar el usuario real cuando esté implementada la autenticación
        saleData.total,
        saleData.paymentMethod || "cash",
        new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ')
      );

      const saleId = saleResult.lastInsertRowid;

      // 2. Insertar items y actualizar stock
      const insertItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      const updateStock = db.prepare(`
        UPDATE products 
        SET stock = stock - ? 
        WHERE id = ?
      `);

      const checkStock = db.prepare(`
        SELECT id, name, stock 
        FROM products 
        WHERE id = ?
      `);

      const insertMovement = db.prepare(`
        INSERT INTO inventory_movements (product_id, type, quantity, reference, reference_id, user_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const itemsWithDetails = [];

      // Obtener información completa de productos (incluyendo tipo_venta)
      const getProductInfo = db.prepare(`
        SELECT id, name, stock, tipo_venta 
        FROM products 
        WHERE id = ?
      `);

      // Procesar cada item de la venta
      for (const item of saleData.items) {
        // Obtener información completa del producto
        const product = getProductInfo.get(item.productId);

        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }

        const tipoVenta = product.tipo_venta || 'UNIDAD';

        // Verificar stock solo para productos que manejan inventario
        if (tipoVenta !== 'PRECIO_LIBRE') {
          if (product.stock < item.quantity) {
            const unit = tipoVenta === 'PESO' ? 'kg' : 'piezas';
            throw new Error(
              `Stock insuficiente para ${product.name}. Disponible: ${product.stock} ${unit}, Solicitado: ${item.quantity} ${unit}`
            );
          }
        }

        // Calcular subtotal según tipo de venta
        let subtotal;
        if (tipoVenta === 'PRECIO_LIBRE') {
          // Para PRECIO_LIBRE, el unitPrice ya es el total
          subtotal = item.unitPrice;
        } else {
          // Para UNIDAD y PESO, multiplicar precio * cantidad
          subtotal = item.unitPrice * item.quantity;
        }

        // Insertar item de venta
        insertItem.run(
          saleId,
          item.productId,
          item.quantity,
          item.unitPrice,
          subtotal
        );

        // Actualizar stock solo para productos que manejan inventario
        if (tipoVenta !== 'PRECIO_LIBRE') {
          updateStock.run(item.quantity, item.productId);

          // Registrar movimiento de inventario
          insertMovement.run(
            item.productId,
            "OUT",
            item.quantity,
            "sale",
            saleId,
            saleData.userId || 1
          );
        }

        // Guardar detalles para el ticket
        itemsWithDetails.push({
          ...item,
          productName: product.name,
          subtotal,
        });
      }

      // 3. Obtener datos completos de la venta para el ticket
      const saleInfo = db
        .prepare(
          `
        SELECT 
          s.*,
          COUNT(si.id) as items_count
        FROM sales s
        LEFT JOIN sale_items si ON s.id = si.sale_id
        WHERE s.id = ?
        GROUP BY s.id
      `
        )
        .get(saleId);

      return {
        saleId,
        saleInfo,
        items: itemsWithDetails,
        timestamp: new Date().toISOString(),
      };
    })();

    // Retornar resultado con datos para imprimir
    return {
      success: true,
      sale: result,
    };
  } catch (error) {
    console.error("Error creating sale:", error);
    throw new Error(error.message || "Error al procesar la venta");
  }
});

/**
 * Handler para obtener todas las ventas
 */
ipcMain.handle("sales:getAll", async () => {
  try {
    const stmt = db.prepare(`
      SELECT 
        s.*,
        COUNT(si.id) as items_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);
    return stmt.all();
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("Error al obtener ventas");
  }
});

/**
 * Handler para obtener detalles de una venta específica
 */
ipcMain.handle("sales:getById", async (event, saleId) => {
  try {
    // Obtener información de la venta
    const saleInfo = db
      .prepare(
        `
      SELECT s.*, COUNT(si.id) as items_count
      FROM sales s
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE s.id = ?
      GROUP BY s.id
    `
      )
      .get(saleId);

    if (!saleInfo) {
      throw new Error("Venta no encontrada");
    }

    // Obtener items de la venta con información del producto
    const items = db
      .prepare(
        `
      SELECT 
        si.*,
        p.name as product_name,
        p.barcode as product_barcode
      FROM sale_items si
      JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `
      )
      .all(saleId);

    return {
      ...saleInfo,
      items,
    };
  } catch (error) {
    console.error("Error fetching sale details:", error);
    throw new Error("Error al obtener detalles de la venta");
  }
});

/**
 * Handler para reimprimir un ticket
 */
ipcMain.handle("sales:reprintTicket", async (event, saleId) => {
  try {
    const saleDetails = await ipcMain.handleOnce("sales:getById", saleId);
    return {
      success: true,
      sale: saleDetails,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error reprinting ticket:", error);
    throw new Error("Error al reimprimir ticket");
  }
});

