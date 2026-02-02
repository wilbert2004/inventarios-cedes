const db = require("./connection");
const bcrypt = require("bcryptjs");

/**
 * Datos iniciales para la base de datos
 */
function runSeeds() {
  console.log("Running database seeds...");

  try {
    // Verificar si ya existe un usuario
    const userExists = db.prepare("SELECT COUNT(*) as count FROM users").get();

    if (userExists.count === 0) {
      // Crear usuario administrador
      const saltAdmin = bcrypt.genSaltSync(10);
      const passwordHashAdmin = bcrypt.hashSync("admin123", saltAdmin);

      db.prepare(`
        INSERT INTO users (id, name, username, password_hash, role, active)
        VALUES (1, 'Administrador', 'admin', ?, 'admin', 1)
      `).run(passwordHashAdmin);

      console.log("✓ Usuario administrador creado (ID: 1)");
      console.log("  Username: admin");
      console.log("  Password: admin123");
      console.log("  Rol: admin");

      // Crear usuario regular
      const saltUser = bcrypt.genSaltSync(10);
      const passwordHashUser = bcrypt.hashSync("user123", saltUser);

      db.prepare(`
        INSERT INTO users (id, name, username, password_hash, role, active)
        VALUES (2, 'Usuario Regular', 'usuario', ?, 'user', 1)
      `).run(passwordHashUser);

      console.log("\n✓ Usuario regular creado (ID: 2)");
      console.log("  Username: usuario");
      console.log("  Password: user123");
      console.log("  Rol: user");
    } else {
      console.log("✓ Usuarios ya existen, omitiendo seed");
    }
  } catch (error) {
    console.error("Error running seeds:", error);
  }

  console.log("Database seeds completed.");
}

module.exports = runSeeds;

