module.exports = {
  // =====================
  // USUARIOS
  // =====================
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','user')) DEFAULT 'user',
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // =====================
  // PRODUCTOS
  // =====================
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      sale_price REAL,
      purchase_cost REAL,
      stock INTEGER DEFAULT 0,
      tipo_venta TEXT DEFAULT 'UNIDAD' CHECK(tipo_venta IN ('UNIDAD','PESO','PRECIO_LIBRE')),
      active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  products_barcode_index: `
    CREATE INDEX IF NOT EXISTS idx_products_barcode
    ON products(barcode)
  `,

  // =====================
  // MOVIMIENTOS DE INVENTARIO
  // =====================
  inventory_movements: `
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('IN','OUT')) NOT NULL,
      quantity INTEGER NOT NULL,
      reference TEXT,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  // =====================
  // ZONAS / CENTROS DE TRABAJO
  // =====================
  locations: `
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      zone TEXT,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `,

  // =====================
  // INVENTARIO (BIENES)
  // =====================
  assets: `
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_number TEXT UNIQUE,
      description TEXT NOT NULL,
      category TEXT,
      brand TEXT,
      model TEXT,
      serial_number TEXT,
      condition TEXT DEFAULT 'ACTIVO',
      location_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    )
  `,

  asset_inventory_index: `
    CREATE INDEX IF NOT EXISTS idx_assets_inventory
    ON assets(inventory_number)
  `,

  // =====================
  // ENTRADAS DE INVENTARIO
  // =====================
  asset_entries: `
    CREATE TABLE IF NOT EXISTS asset_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio TEXT UNIQUE NOT NULL,
      provider TEXT,
      entry_date TEXT NOT NULL,
      description TEXT,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  asset_entry_items: `
    CREATE TABLE IF NOT EXISTS asset_entry_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      asset_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      condition TEXT DEFAULT 'GOOD' CHECK(condition IN ('GOOD','DAMAGED','DEFECTIVE')),
      FOREIGN KEY (entry_id) REFERENCES asset_entries(id),
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    )
  `,

  // =====================
  // SALIDAS / BAJAS
  // =====================
  asset_exits: `
    CREATE TABLE IF NOT EXISTS asset_exits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      folio TEXT UNIQUE NOT NULL,
      exit_date TEXT NOT NULL,
      reason TEXT NOT NULL,
      delivered_by TEXT,
      received_by TEXT,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  asset_exit_items: `
    CREATE TABLE IF NOT EXISTS asset_exit_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exit_id INTEGER NOT NULL,
      asset_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1,
      FOREIGN KEY (exit_id) REFERENCES asset_exits(id),
      FOREIGN KEY (asset_id) REFERENCES assets(id)
    )
  `,

  // =====================
  // HISTORIAL DE MOVIMIENTOS
  // =====================
  asset_movements: `
    CREATE TABLE IF NOT EXISTS asset_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_id INTEGER NOT NULL,
      movement_type TEXT CHECK(movement_type IN ('ENTRY','EXIT')) NOT NULL,
      reference_folio TEXT,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_id) REFERENCES assets(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  // =====================
  // PRODUCTOS EN RESGUARDO (CEDES)
  // =====================
  // =====================
  // PRODUCTOS EN RESGUARDO (REGISTRO Y CICLO DE VIDA)
  // =====================
  custody_products: `
    CREATE TABLE IF NOT EXISTS custody_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_number TEXT UNIQUE NOT NULL,
      serial_number TEXT,
      description TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      reason TEXT CHECK(reason IN ('BAJA','RESGUARDO','TRASLADO')) NOT NULL DEFAULT 'RESGUARDO',
      product_status TEXT CHECK(product_status IN ('EN_TRANSITO','EN_RESGUARDO','BAJA_DEFINITIVA')) NOT NULL DEFAULT 'EN_TRANSITO',
      reference_folio TEXT,
      center_origin TEXT,
      notes TEXT,
      entregado_por_centro_trabajo TEXT,
      fecha_entrega TEXT,
      recibido_por_chofer TEXT,
      fecha_recepcion_chofer TEXT,
      recibido_por_almacen TEXT,
      fecha_recepcion_almacen TEXT,
      fecha_baja TEXT,
      motivo_baja TEXT,
      registered_by INTEGER,
      is_deleted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (registered_by) REFERENCES users(id)
    )
  `,

  custody_products_inventory_index: `
    CREATE INDEX IF NOT EXISTS idx_custody_products_inventory
    ON custody_products(inventory_number)
  `,

  custody_products_serial_index: `
    CREATE INDEX IF NOT EXISTS idx_custody_products_serial
    ON custody_products(serial_number)
  `,

  custody_products_status_index: `
    CREATE INDEX IF NOT EXISTS idx_custody_products_status
    ON custody_products(product_status)
  `,

  // =====================
  // HISTORIAL DE EVENTOS DE PRODUCTOS (INMUTABLE)
  // =====================
  custody_product_history: `
    CREATE TABLE IF NOT EXISTS custody_product_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      tipo_evento TEXT CHECK(tipo_evento IN ('registro','entrega','recepcion_chofer','recepcion_almacen','cambio_estado','baja','actualizacion')) NOT NULL,
      descripcion TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT,
      datos_json TEXT,
      changed_by INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES custody_products(id),
      FOREIGN KEY (changed_by) REFERENCES users(id)
    )
  `,

  custody_product_history_product_index: `
    CREATE INDEX IF NOT EXISTS idx_custody_product_history_product
    ON custody_product_history(product_id)
  `
};
