const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { getDatabasePath, getDataDirectory, isDevelopment } = require("../utils/paths");

// La base de datos se guarda en diferentes ubicaciones según el entorno:
// - Desarrollo: C:\Users\[Usuario]\AppData\Roaming\absolute-pos-app\dev\pos.db
// - Producción: C:\Users\[Usuario]\AppData\Roaming\absolute-pos-app\pos.db
const dbPath = getDatabasePath();

// Asegurar que el directorio existe antes de crear la base de datos
const dataDir = getDataDirectory();
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`✓ Directorio de datos creado: ${dataDir}`);
}

// Configuración de la base de datos
// verbose solo en desarrollo para no llenar los logs en producción
const dbOptions = {};
if (isDevelopment()) {
  dbOptions.verbose = console.log;
  console.log(`📁 Base de datos en desarrollo: ${dbPath}`);
}

const db = new Database(dbPath, dbOptions);

// Habilitar Write-Ahead Logging para mejor rendimiento
db.pragma("journal_mode = WAL");

// Configuraciones adicionales para mejor rendimiento y seguridad
db.pragma("foreign_keys = ON"); // Habilitar claves foráneas
db.pragma("synchronous = NORMAL"); // Balance entre seguridad y rendimiento

module.exports = db;
