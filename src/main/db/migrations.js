const db = require("./connection");
const tables = require("./tables");
const runSeeds = require("./seeds");
const migrationSystem = require("./migration-system");

/**
 * Ejecutar migraciones del sistema
 */
function runMigrations() {
  console.log("Running database migrations...");
  
  // 1. Primero crear todas las tablas base (CREATE TABLE IF NOT EXISTS)
  // Esto es seguro y no afecta tablas existentes
  // Incluye schema_migrations que se necesita para el sistema de versionado
  db.transaction(() => {
    Object.values(tables).forEach((sql) => {
      db.prepare(sql).run();
    });
  })();
  
  // 2. Inicializar tabla de versiones (por si acaso no se creó)
  migrationSystem.initSchemaVersionTable();
  
  // 3. Registrar migración inicial si es la primera vez
  const currentVersion = migrationSystem.getCurrentVersion();
  if (currentVersion === 0) {
    migrationSystem.recordMigration(1, "initial_schema");
    console.log("✓ Esquema inicial registrado");
  }
  
  // 4. Ejecutar migraciones incrementales (ALTER TABLE, nuevas tablas, etc.)
  migrationSystem.runMigrations();
  
  console.log("Database migrations completed.");

  // Ejecutar seeds (datos iniciales) solo si es instalación nueva
  if (currentVersion === 0) {
    runSeeds();
  }
}

// Ejecutar migraciones al cargar el módulo
runMigrations();

module.exports = runMigrations;
