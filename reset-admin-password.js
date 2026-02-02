/**
 * Script para resetear la contraseña del administrador
 * Ejecutar con: node reset-admin-password.js
 */

const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const path = require("path");
const os = require("os");

// Determinar la ubicación de la base de datos según el SO
let dbPath;
if (process.platform === "win32") {
  dbPath = path.join(
    process.env.APPDATA,
    "absolute-pos-app",
    "pos.db"
  );
} else if (process.platform === "darwin") {
  dbPath = path.join(
    os.homedir(),
    "Library",
    "Application Support",
    "absolute-pos-app",
    "pos.db"
  );
} else {
  dbPath = path.join(
    os.homedir(),
    ".config",
    "absolute-pos-app",
    "pos.db"
  );
}

console.log("📍 Ubicación de la base de datos:", dbPath);

try {
  const db = new Database(dbPath);
  
  // Hashear nueva contraseña
  const newPassword = "admin123";
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(newPassword, salt);
  
  // Actualizar el usuario admin
  const stmt = db.prepare(`
    UPDATE users 
    SET password_hash = ? 
    WHERE username = 'admin'
  `);
  
  const result = stmt.run(passwordHash);
  
  if (result.changes > 0) {
    console.log("✅ Contraseña del admin actualizada exitosamente!");
    console.log("");
    console.log("Credenciales:");
    console.log("  Usuario: admin");
    console.log("  Contraseña: admin123");
    console.log("");
    console.log("Reinicia la aplicación e intenta hacer login nuevamente.");
  } else {
    console.log("⚠️  No se encontró el usuario admin");
  }
  
  db.close();
} catch (error) {
  console.error("❌ Error:", error.message);
  console.log("");
  console.log("Si la base de datos no existe, inicia la aplicación primero.");
}



