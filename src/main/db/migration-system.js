const db = require("./connection");

/**
 * Sistema de migraciones versionado
 * Permite agregar campos, tablas y relaciones sin perder datos
 */

// Tabla para rastrear versiones de esquema
const SCHEMA_VERSION_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`;

// Versión actual del esquema
// Incrementar este número cada vez que agregues una nueva migración
const CURRENT_SCHEMA_VERSION = 12;

/**
 * Inicializar tabla de versiones
 */
function initSchemaVersionTable() {
  db.prepare(SCHEMA_VERSION_TABLE).run();
}

/**
 * Obtener versión actual de la base de datos
 */
function getCurrentVersion() {
  try {
    const result = db.prepare("SELECT MAX(version) as version FROM schema_migrations").get();
    return result?.version || 0;
  } catch (error) {
    // Si la tabla no existe, retornar 0
    return 0;
  }
}

/**
 * Registrar migración aplicada
 */
function recordMigration(version, name) {
  db.prepare(
    "INSERT INTO schema_migrations (version, name) VALUES (?, ?)"
  ).run(version, name);
}

/**
 * Verificar si una columna existe en una tabla
 */
function columnExists(tableName, columnName) {
  try {
    const columns = db
      .prepare(`PRAGMA table_info(${tableName})`)
      .all()
      .map((col) => col.name);
    return columns.includes(columnName);
  } catch (error) {
    return false;
  }
}

/**
 * Definición de migraciones
 * Cada migración tiene: version, name, up (función que aplica cambios)
 * 
 * IMPORTANTE: Al agregar una nueva migración:
 * 1. Incrementar CURRENT_SCHEMA_VERSION
 * 2. Agregar la migración aquí
 * 3. Actualizar tables.js para nuevas instalaciones
 */
const migrations = [
  {
    version: 1,
    name: "initial_schema",
    up: () => {
      // Esta migración ya está aplicada por el sistema de tablas
      // Solo la registramos
      console.log("✓ Migración 1: Esquema inicial");
    },
  },
  {
    version: 2,
    name: "add_reset_code_to_users",
    up: () => {
      // Verificar si las columnas ya existen (migración idempotente)
      if (!columnExists("users", "reset_code")) {
        db.prepare("ALTER TABLE users ADD COLUMN reset_code TEXT").run();
        console.log("✓ Migración 2: Agregado campo reset_code a users");
      }
      if (!columnExists("users", "reset_code_expires")) {
        db.prepare("ALTER TABLE users ADD COLUMN reset_code_expires TEXT").run();
        console.log("✓ Migración 2: Agregado campo reset_code_expires a users");
      }
    },
  },
  {
    version: 3,
    name: "add_license_table",
    up: () => {
      if (!tableExists("license")) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS license (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hardware_id TEXT UNIQUE NOT NULL,
            license_key TEXT,
            activated_at TEXT,
            installation_date TEXT DEFAULT CURRENT_TIMESTAMP,
            first_access_date TEXT,
            demo_expires_at TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
        console.log("✓ Migración 3: Creada tabla license");
      }
    },
  },
  {
    version: 4,
    name: "add_product_sale_types",
    up: () => {
      // Agregar campo tipo_venta a products
      if (!columnExists("products", "tipo_venta")) {
        db.prepare("ALTER TABLE products ADD COLUMN tipo_venta TEXT DEFAULT 'UNIDAD'").run();
        console.log("✓ Migración 4: Agregado campo tipo_venta a products");
      }

      // Actualizar productos existentes para que tengan tipo_venta = 'UNIDAD' por defecto
      db.prepare("UPDATE products SET tipo_venta = 'UNIDAD' WHERE tipo_venta IS NULL").run();

      // Nota: SQLite no soporta cambiar el tipo de columna directamente
      // Las columnas stock, quantity en sale_items e inventory_movements
      // pueden almacenar valores REAL sin problemas aunque estén definidas como INTEGER
      // Para nuevas instalaciones, se actualizará tables.js
      console.log("✓ Migración 4: Soporte para tipos de venta (UNIDAD, PESO, PRECIO_LIBRE) agregado");
    },
  },
  {
    version: 5,
    name: "add_entry_item_condition",
    up: () => {
      // Agregar campo condition a asset_entry_items
      if (!columnExists("asset_entry_items", "condition")) {
        db.prepare("ALTER TABLE asset_entry_items ADD COLUMN condition TEXT DEFAULT 'GOOD' CHECK(condition IN ('GOOD','DAMAGED','DEFECTIVE'))").run();
        console.log("✓ Migración 5: Agregado campo condition a asset_entry_items");
      }
    },
  },
  {
    version: 6,
    name: "add_custody_module_tables",
    up: () => {
      // Crear tabla custody_entries (Encabezado de resguardo)
      if (!tableExists("custody_entries")) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS custody_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio TEXT UNIQUE NOT NULL,
            
            -- Datos del origen
            origin_plant_name TEXT NOT NULL,
            origin_plant_code TEXT,
            origin_address TEXT,
            origin_municipality TEXT,
            origin_zone TEXT,
            
            -- Datos del documento
            entry_date TEXT NOT NULL,
            
            -- Responsables
            delivered_by_name TEXT NOT NULL,
            delivered_by_position TEXT,
            transported_by_name TEXT NOT NULL,
            transported_by_license TEXT,
            received_by_name TEXT NOT NULL,
            received_by_position TEXT,
            
            -- Firma digital/autorización
            received_signature_date TEXT,
            status TEXT DEFAULT 'EN_RESGUARDO' CHECK(status IN ('EN_RESGUARDO','DEVUELTO','BAJA','TRASLADO')),
            
            user_id INTEGER,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `).run();
        console.log("✓ Migración 6a: Creada tabla custody_entries");
      }

      // Crear tabla custody_items (Detalle de bienes en resguardo)
      if (!tableExists("custody_items")) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS custody_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custody_entry_id INTEGER NOT NULL,
            
            -- Datos del bien
            quantity INTEGER NOT NULL,
            inventory_number TEXT UNIQUE NOT NULL,
            description TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            serial_number TEXT UNIQUE,
            
            -- Motivo y estado
            reason TEXT NOT NULL CHECK(reason IN ('BAJA','RESGUARDO','TRASLADO')),
            status TEXT DEFAULT 'EN_RESGUARDO' CHECK(status IN ('EN_RESGUARDO','ACTIVO','INACTIVO','BAJA')),
            
            -- Condición inicial
            initial_condition TEXT DEFAULT 'BUENO' CHECK(initial_condition IN ('BUENO','DAÑADO','DEFECTUOSO')),
            
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (custody_entry_id) REFERENCES custody_entries(id)
          )
        `).run();
        console.log("✓ Migración 6b: Creada tabla custody_items");
      }

      // Crear tabla asset_location_history (Trazabilidad)
      if (!tableExists("asset_location_history")) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS asset_location_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custody_item_id INTEGER NOT NULL,
            
            location TEXT,
            status TEXT,
            moved_by_user_id INTEGER,
            moved_date TEXT,
            reason TEXT,
            
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (custody_item_id) REFERENCES custody_items(id),
            FOREIGN KEY (moved_by_user_id) REFERENCES users(id)
          )
        `).run();
        console.log("✓ Migración 6c: Creada tabla asset_location_history");
      }
    },
  },
  {
    version: 7,
    name: "add_reception_fields_to_custody_products",
    up: () => {
      // Agregar campos de recepción en almacén (obligatorios para pasar a EN_RESGUARDO)
      if (!columnExists("custody_products", "recibido_por_almacen")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN recibido_por_almacen TEXT").run();
        console.log("✓ Migración 7: Agregado campo recibido_por_almacen a custody_products");
      }
      if (!columnExists("custody_products", "fecha_recepcion_almacen")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN fecha_recepcion_almacen TEXT").run();
        console.log("✓ Migración 7: Agregado campo fecha_recepcion_almacen a custody_products");
      }

      // Agregar campos de recepción por chofer (opcionales)
      if (!columnExists("custody_products", "recibido_por_chofer")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN recibido_por_chofer TEXT").run();
        console.log("✓ Migración 7: Agregado campo recibido_por_chofer a custody_products");
      }
      if (!columnExists("custody_products", "fecha_recepcion_chofer")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN fecha_recepcion_chofer TEXT").run();
        console.log("✓ Migración 7: Agregado campo fecha_recepcion_chofer a custody_products");
      }

      // Actualizar estado de productos existentes que están EN RESGUARDO
      // Para que mantengan su estado actual pero con datos de recepción ficticios
      db.prepare(`
        UPDATE custody_products 
        SET 
          recibido_por_almacen = 'Sistema (migración automática)',
          fecha_recepcion_almacen = created_at
        WHERE product_status = 'EN RESGUARDO' 
        AND recibido_por_almacen IS NULL
      `).run();

      console.log("✓ Migración 7: Agregados campos de recepción a custody_products");
    },
  },
  {
    version: 8,
    name: "add_delivery_fields_to_custody_products",
    up: () => {
      // Agregar campos de ENTREGA (obligatorios al crear)
      if (!columnExists("custody_products", "entregado_por_centro_trabajo")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN entregado_por_centro_trabajo TEXT").run();
        console.log("✓ Migración 8: Agregado campo entregado_por_centro_trabajo a custody_products");
      }
      if (!columnExists("custody_products", "fecha_entrega")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN fecha_entrega TEXT").run();
        console.log("✓ Migración 8: Agregado campo fecha_entrega a custody_products");
      }

      // Migrar datos existentes: copiar datos de recepción a entrega para mantener consistencia
      db.prepare(`
        UPDATE custody_products 
        SET 
          entregado_por_centro_trabajo = COALESCE(center_origin, 'No especificado'),
          fecha_entrega = created_at
        WHERE entregado_por_centro_trabajo IS NULL
      `).run();

      console.log("✓ Migración 8: Agregados campos de entrega a custody_products");
    },
  },
  {
    version: 9,
    name: "refactor_custody_system_to_lifecycle_management",
    up: () => {
      // 1. Agregar campos de baja definitiva
      if (!columnExists("custody_products", "fecha_baja")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN fecha_baja TEXT").run();
        console.log("✓ Migración 9: Agregado campo fecha_baja a custody_products");
      }
      if (!columnExists("custody_products", "motivo_baja")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN motivo_baja TEXT").run();
        console.log("✓ Migración 9: Agregado campo motivo_baja a custody_products");
      }
      if (!columnExists("custody_products", "is_deleted")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN is_deleted INTEGER DEFAULT 0").run();
        console.log("✓ Migración 9: Agregado campo is_deleted (soft delete) a custody_products");
      }

      // 2. Actualizar estados: cambiar espacios en estados a guiones bajos
      db.prepare(`
        UPDATE custody_products 
        SET product_status = 'EN_RESGUARDO'
        WHERE product_status = 'EN RESGUARDO'
      `).run();

      db.prepare(`
        UPDATE custody_products 
        SET product_status = 'BAJA_DEFINITIVA'
        WHERE product_status = 'BAJA DEFINITIVA'
      `).run();

      // 3. Actualizar tabla de historial: agregar nuevos campos
      if (!columnExists("custody_product_history", "tipo_evento")) {
        db.prepare("ALTER TABLE custody_product_history ADD COLUMN tipo_evento TEXT DEFAULT 'cambio_estado'").run();
        console.log("✓ Migración 9: Agregado campo tipo_evento a custody_product_history");
      }
      if (!columnExists("custody_product_history", "descripcion")) {
        db.prepare("ALTER TABLE custody_product_history ADD COLUMN descripcion TEXT").run();
        console.log("✓ Migración 9: Agregado campo descripcion a custody_product_history");
      }
      if (!columnExists("custody_product_history", "datos_json")) {
        db.prepare("ALTER TABLE custody_product_history ADD COLUMN datos_json TEXT").run();
        console.log("✓ Migración 9: Agregado campo datos_json a custody_product_history");
      }

      // 4. Migrar historial existente: agregar descripción a registros antiguos
      db.prepare(`
        UPDATE custody_product_history 
        SET 
          descripcion = 'Cambio de estado: ' || COALESCE(previous_status, 'inicial') || ' → ' || new_status,
          tipo_evento = 'cambio_estado'
        WHERE descripcion IS NULL
      `).run();

      console.log("✓ Migración 9: Sistema refactorizado a gestión de ciclo de vida completo");
    },
  },
  {
    version: 10,
    name: "add_image_and_condition_to_custody_products",
    up: () => {
      // Agregar campo de imagen (BLOB para almacenar imagen codificada en base64)
      if (!columnExists("custody_products", "product_image")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN product_image TEXT").run();
        console.log("✓ Migración 10: Agregado campo product_image a custody_products");
      }

      // Agregar campo de condición/defecto del producto
      // Opciones: BUENO, CASILLA_MALA, DEFECTUOSO, etc.
      if (!columnExists("custody_products", "product_condition")) {
        db.prepare("ALTER TABLE custody_products ADD COLUMN product_condition TEXT DEFAULT 'BUENO' CHECK(product_condition IN ('BUENO','CASILLA_MALA','DEFECTUOSO'))").run();
        console.log("✓ Migración 10: Agregado campo product_condition a custody_products");
      }

      console.log("✓ Migración 10: Agregados campos de imagen y condición del producto");
    },
  },
  {
    version: 11,
    name: "add_custody_exits_tables",
    up: () => {
      // 1. Crear tabla custody_exits (Encabezado de salidas)
      if (!tableExists("custody_exits")) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS custody_exits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            folio TEXT UNIQUE NOT NULL,
            exit_date TEXT NOT NULL,
            description TEXT,
            destination TEXT DEFAULT 'Zona Principal',
            
            -- Responsables (3 niveles)
            delivered_by TEXT NOT NULL,
            delivered_by_position TEXT NOT NULL,
            transported_by TEXT NOT NULL,
            transported_by_license TEXT NOT NULL,
            received_by TEXT NOT NULL,
            received_by_position TEXT NOT NULL,
            
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `).run();
        console.log("✓ Migración 11: Creada tabla custody_exits");
      }

      // 2. Crear tabla custody_exit_items (Detalle de bienes en cada salida)
      if (!tableExists("custody_exit_items")) {
        db.prepare(`
          CREATE TABLE IF NOT EXISTS custody_exit_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            custody_exit_id INTEGER NOT NULL,
            custody_product_id INTEGER NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (custody_exit_id) REFERENCES custody_exits(id),
            FOREIGN KEY (custody_product_id) REFERENCES custody_products(id)
          )
        `).run();
        console.log("✓ Migración 11: Creada tabla custody_exit_items");
      }

      // 3. Crear índice en folio de custody_exits
      if (!indexExists("idx_custody_exits_folio")) {
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_custody_exits_folio
          ON custody_exits(folio)
        `).run();
        console.log("✓ Migración 11: Creado índice idx_custody_exits_folio");
      }

      // 4. SQLite no permite modificar CHECK constraints de columnas existentes
      // Solución: Crear tabla temporal, copiar datos, eliminar table original, renombrar
      // Esto es necesario para agregar 'TRASLADADO' al constraint de product_status

      // Verificar si necesitamos actualizar el constraint
      const tableInfo = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='custody_products'").get();

      if (tableInfo && !tableInfo.sql.includes("TRASLADADO")) {
        console.log("  → Actualizando constraint de product_status para incluir 'TRASLADADO'...");

        // Crear tabla temporal con el nuevo constraint (sin CHECK constraint en product_condition para permitir copia)
        db.prepare(`
          CREATE TABLE custody_products_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            inventory_number TEXT UNIQUE NOT NULL,
            serial_number TEXT,
            description TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            quantity INTEGER NOT NULL DEFAULT 1,
            reason TEXT CHECK(reason IN ('BAJA','RESGUARDO','TRASLADO')) NOT NULL DEFAULT 'RESGUARDO',
            product_status TEXT CHECK(product_status IN ('EN_TRANSITO','EN_RESGUARDO','TRASLADADO','BAJA_DEFINITIVA')) NOT NULL DEFAULT 'EN_TRANSITO',
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
            product_image TEXT,
            product_condition TEXT DEFAULT 'BUENO',
            registered_by INTEGER,
            is_deleted INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (registered_by) REFERENCES users(id)
          )
        `).run();

        // Copiar datos normalizando product_condition
        db.prepare(`
          INSERT INTO custody_products_new 
          SELECT 
            id, inventory_number, serial_number, description, brand, model, quantity,
            reason, product_status, reference_folio, center_origin, notes,
            entregado_por_centro_trabajo, fecha_entrega, 
            recibido_por_chofer, fecha_recepcion_chofer,
            recibido_por_almacen, fecha_recepcion_almacen,
            fecha_baja, motivo_baja, product_image,
            COALESCE(product_condition, 'BUENO') as product_condition,
            registered_by, is_deleted, created_at, updated_at
          FROM custody_products
        `).run();

        // Eliminar tabla original
        db.prepare("DROP TABLE custody_products").run();

        // Renombrar tabla nueva
        db.prepare("ALTER TABLE custody_products_new RENAME TO custody_products").run();

        // Recrear índices
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_custody_products_inventory
          ON custody_products(inventory_number)
        `).run();

        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_custody_products_serial
          ON custody_products(serial_number)
        `).run();

        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_custody_products_status
          ON custody_products(product_status)
        `).run();

        console.log("  ✓ Constraint actualizado con estado 'TRASLADADO'");
      }

      console.log("✓ Migración 11: Sistema de salidas de resguardo implementado");
    },
  },
  // ============================================
  // MIGRACIÓN 12: Permitir tipo_evento 'salida'
  // ============================================
  {
    version: 12,
    name: "Add salida event type to custody_product_history",
    up() {
      // SQLite no permite modificar CHECK constraints de columnas existentes
      // Solución: Crear tabla temporal, copiar datos, eliminar table original, renombrar

      console.log("  → Actualizando constraint de tipo_evento para incluir 'salida'...");

      // Crear tabla temporal con el nuevo constraint
      db.prepare(`
        CREATE TABLE custody_product_history_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          tipo_evento TEXT CHECK(tipo_evento IN ('registro','entrega','recepcion_chofer','recepcion_almacen','cambio_estado','baja','actualizacion','salida')) NOT NULL,
          descripcion TEXT NOT NULL,
          previous_status TEXT,
          new_status TEXT,
          datos_json TEXT,
          changed_by INTEGER,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES custody_products(id),
          FOREIGN KEY (changed_by) REFERENCES users(id)
        )
      `).run();

      // Copiar datos de la tabla original
      db.prepare(`
        INSERT INTO custody_product_history_new 
        SELECT * FROM custody_product_history
      `).run();

      // Eliminar tabla original
      db.prepare("DROP TABLE custody_product_history").run();

      // Renombrar tabla nueva
      db.prepare("ALTER TABLE custody_product_history_new RENAME TO custody_product_history").run();

      // Recrear índice
      if (!indexExists("idx_custody_product_history_product")) {
        db.prepare(`
          CREATE INDEX IF NOT EXISTS idx_custody_product_history_product
          ON custody_product_history(product_id)
        `).run();
      }

      console.log("  ✓ Constraint actualizado: tipo_evento ahora acepta 'salida'");
      console.log("✓ Migración 12: Soporte para eventos de salida agregado");
    },
  },
];

/**
 * Ejecutar migraciones pendientes
 */
function runMigrations() {
  initSchemaVersionTable();

  const currentVersion = getCurrentVersion();
  const targetVersion = CURRENT_SCHEMA_VERSION;

  if (currentVersion >= targetVersion) {
    console.log(`✓ Base de datos actualizada (versión ${currentVersion})`);
    return;
  }

  console.log(`🔄 Aplicando migraciones: ${currentVersion} → ${targetVersion}`);

  // Ejecutar migraciones pendientes
  const pendingMigrations = migrations.filter(
    (m) => m.version > currentVersion && m.version <= targetVersion
  );

  if (pendingMigrations.length === 0) {
    console.log("✓ No hay migraciones pendientes");
    return;
  }

  // Ejecutar en transacción
  const transaction = db.transaction(() => {
    pendingMigrations.forEach((migration) => {
      try {
        console.log(`  → Aplicando migración ${migration.version}: ${migration.name}`);
        migration.up();
        recordMigration(migration.version, migration.name);
        console.log(`  ✓ Migración ${migration.version} aplicada`);
      } catch (error) {
        console.error(`  ✗ Error en migración ${migration.version}:`, error);
        throw error; // Rollback automático
      }
    });
  });

  transaction();

  console.log(`✓ Migraciones completadas. Versión actual: ${targetVersion}`);
}

/**
 * Verificar si una tabla existe
 */
function tableExists(tableName) {
  try {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      )
      .get(tableName);
    return !!result;
  } catch (error) {
    return false;
  }
}

/**
 * Verificar si un índice existe
 */
function indexExists(indexName) {
  try {
    const result = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='index' AND name=?"
      )
      .get(indexName);
    return !!result;
  } catch (error) {
    return false;
  }
}

module.exports = {
  runMigrations,
  getCurrentVersion,
  CURRENT_SCHEMA_VERSION,
  recordMigration,
  initSchemaVersionTable,
  columnExists,
  tableExists,
  indexExists,
};
