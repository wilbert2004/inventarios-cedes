const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * Handler para obtener todos los productos
 */
ipcMain.handle("products:getAll", async () => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM products 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Error al obtener productos");
  }
});

/**
 * Handler para crear un nuevo producto
 */
ipcMain.handle("products:create", async (event, product) => {
  try {
    const insertStmt = db.prepare(`
      INSERT INTO products (barcode, name, description, sale_price, purchase_cost, stock, tipo_venta, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertStmt.run(
      product.barcode || null,
      product.name,
      product.description || null,
      product.sale_price,
      product.purchase_cost,
      product.stock || 0,
      product.tipo_venta || 'UNIDAD',
      product.active
    );

    // Obtener el producto completo desde la base de datos
    const selectStmt = db.prepare(`
      SELECT * FROM products WHERE id = ?
    `);
    const createdProduct = selectStmt.get(result.lastInsertRowid);

    return createdProduct;
  } catch (error) {
    console.error("Error creating product:", error);
    // Manejar error de código de barras duplicado
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error("El código de barras ya existe");
    }
    throw new Error("Error al crear producto");
  }
});

/**
 * Handler para actualizar un producto
 */
ipcMain.handle("products:update", async (event, id, product) => {
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET barcode = ?, name = ?, description = ?, sale_price = ?, purchase_cost = ?, stock = ?, tipo_venta = ?, active = ?
      WHERE id = ?
    `);

    stmt.run(
      product.barcode || null,
      product.name,
      product.description || null,
      product.sale_price,
      product.purchase_cost,
      product.stock || 0,
      product.tipo_venta || 'UNIDAD',
      product.active,
      id
    );

    return { id, ...product };
  } catch (error) {
    console.error("Error updating product:", error);
    // Manejar error de código de barras duplicado
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error("El código de barras ya existe");
    }
    throw new Error("Error al actualizar producto");
  }
});

/**
 * Handler para eliminar un producto (soft delete)
 */
ipcMain.handle("products:delete", async (event, id) => {
  try {
    const stmt = db.prepare(`
      UPDATE products 
      SET active = 0 
      WHERE id = ?
    `);

    stmt.run(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Error al eliminar producto");
  }
});

