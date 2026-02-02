const { ipcMain } = require("electron");
const db = require("../db/connection");
const bcrypt = require("bcryptjs");

/**
 * Handler para obtener todos los usuarios
 */
ipcMain.handle("users:getAll", async () => {
  try {
    const stmt = db.prepare(`
      SELECT id, name, username, role, active, created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    return stmt.all();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Error al obtener usuarios");
  }
});

/**
 * Handler para crear un nuevo usuario
 */
ipcMain.handle("users:create", async (event, userData) => {
  try {
    // Validar que el username no exista
    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(userData.username);

    if (existingUser) {
      throw new Error("El nombre de usuario ya existe");
    }

    // Hashear la contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(userData.password, salt);

    // Insertar usuario
    const stmt = db.prepare(`
      INSERT INTO users (name, username, password_hash, role, active)
      VALUES (?, ?, ?, ?, ?)
    `);

    // Asegurar que todos los valores sean del tipo correcto para SQLite
    const name = String(userData.name || '');
    const username = String(userData.username || '');
    const role = String(userData.role || "cashier");
    const active = userData.active !== undefined ? (userData.active ? 1 : 0) : 1;

    // Validar que los campos requeridos no estén vacíos
    if (!name || !username) {
      throw new Error("El nombre y nombre de usuario son requeridos");
    }

    const result = stmt.run(
      name,
      username,
      passwordHash,
      role,
      active
    );

    return {
      id: result.lastInsertRowid,
      name,
      username,
      role,
      active,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "Error al crear usuario");
  }
});

/**
 * Handler para actualizar un usuario
 */
ipcMain.handle("users:update", async (event, id, userData) => {
  try {
    // Si se envía una nueva contraseña, hashearla
    let updateFields = `
      name = ?, 
      username = ?, 
      role = ?, 
      active = ?
    `;
    
    // Asegurar que todos los valores sean del tipo correcto para SQLite
    const name = String(userData.name || '');
    const username = String(userData.username || '');
    const role = String(userData.role || "cashier");
    const active = userData.active !== undefined ? (userData.active ? 1 : 0) : 1;
    
    // Validar que los campos requeridos no estén vacíos
    if (!name || !username) {
      throw new Error("El nombre y nombre de usuario son requeridos");
    }
    
    let params = [
      name,
      username,
      role,
      active,
    ];

    // Si hay nueva contraseña, incluirla
    if (userData.password) {
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(userData.password, salt);
      updateFields += `, password_hash = ?`;
      params.push(passwordHash);
    }

    params.push(id);

    const stmt = db.prepare(`
      UPDATE users 
      SET ${updateFields}
      WHERE id = ?
    `);

    stmt.run(...params);

    return {
      id,
      name,
      username,
      role,
      active,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.message.includes("UNIQUE constraint failed")) {
      throw new Error("El nombre de usuario ya existe");
    }
    throw new Error("Error al actualizar usuario");
  }
});

/**
 * Handler para eliminar un usuario (soft delete)
 */
ipcMain.handle("users:delete", async (event, id) => {
  try {
    // No permitir eliminar el usuario con ID 1 (admin principal)
    if (id === 1) {
      throw new Error("No se puede eliminar el usuario administrador principal");
    }

    const stmt = db.prepare(`
      UPDATE users 
      SET active = 0 
      WHERE id = ?
    `);

    stmt.run(id);
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error(error.message || "Error al eliminar usuario");
  }
});

/**
 * Handler para validar credenciales de login
 */
ipcMain.handle("users:login", async (event, credentials) => {
  try {
    const user = db
      .prepare(
        `
      SELECT id, name, username, password_hash, role, active
      FROM users 
      WHERE username = ?
    `
      )
      .get(credentials.username);

    if (!user) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    if (!user.active) {
      throw new Error("Usuario inactivo. Contacta al administrador");
    }

    // Verificar contraseña
    const isValidPassword = bcrypt.compareSync(
      credentials.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new Error("Usuario o contraseña incorrectos");
    }

    // Retornar datos del usuario sin el hash de la contraseña
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    };
  } catch (error) {
    console.error("Error during login:", error);
    throw new Error(error.message || "Error al iniciar sesión");
  }
});

/**
 * Handler para solicitar recuperación de contraseña
 */
ipcMain.handle("users:requestPasswordReset", async (event, username) => {
  try {
    // Buscar el usuario
    const user = db
      .prepare("SELECT id, username FROM users WHERE username = ? AND active = 1")
      .get(username);

    if (!user) {
      console.log("Intento de recuperación para usuario inexistente:", username);
      throw new Error("No se pudo procesar la solicitud");
    }

    // Generar código aleatorio (6 caracteres)
    const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Calcular expiración (30 minutos desde ahora)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Guardar en la base de datos
    const stmt = db.prepare(`
      UPDATE users 
      SET reset_code = ?, reset_code_expires = ?
      WHERE id = ?
    `);

    stmt.run(resetCode, expiresAt, user.id);

    return {
      success: true,
      message: "Código enviado. Válido por 30 minutos.",
      code: resetCode, // En producción, esto NO se retorna, se envía por email
    };
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw new Error(error.message || "Error al solicitar recuperación");
  }
});

/**
 * Handler para resetear la contraseña con código válido
 */
ipcMain.handle("users:resetPassword", async (event, resetData) => {
  try {
    const { username, resetCode, newPassword, confirmPassword } = resetData;

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      throw new Error("Las contraseñas no coinciden");
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Buscar usuario con el código
    const user = db
      .prepare(`
        SELECT id, reset_code, reset_code_expires 
        FROM users 
        WHERE username = ?
      `)
      .get(username);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Validar que el código exista
    if (!user.reset_code) {
      throw new Error("No hay código válido para este usuario");
    }

    // Validar que el código sea correcto
    if (user.reset_code !== resetCode) {
      throw new Error("Código incorrecto");
    }

    // Validar que no esté expirado
    const now = new Date();
    const expiresAt = new Date(user.reset_code_expires);
    if (now > expiresAt) {
      throw new Error("El código ha expirado. Solicita uno nuevo.");
    }

    // Hashear la nueva contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    // Actualizar contraseña y limpiar código
    const stmt = db.prepare(`
      UPDATE users 
      SET password_hash = ?, reset_code = NULL, reset_code_expires = NULL
      WHERE id = ?
    `);

    stmt.run(passwordHash, user.id);

    return {
      success: true,
      message: "Contraseña cambiada exitosamente. Por favor inicia sesión.",
    };
  } catch (error) {
    console.error("Error resetting password:", error);
    throw new Error(error.message || "Error al cambiar contraseña");
  }
});

/**
 * Handler para cambiar contraseña del usuario actual
 */
ipcMain.handle("users:changePassword", async (event, userId, currentPassword, newPassword) => {
  try {
    // Validar longitud mínima
    if (newPassword.length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    // Obtener usuario actual
    const user = db
      .prepare("SELECT id, password_hash FROM users WHERE id = ?")
      .get(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verificar contraseña actual
    const isValidPassword = bcrypt.compareSync(currentPassword, user.password_hash);

    if (!isValidPassword) {
      throw new Error("La contraseña actual es incorrecta");
    }

    // Hashear nueva contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    // Actualizar contraseña
    const stmt = db.prepare(`
      UPDATE users 
      SET password_hash = ?
      WHERE id = ?
    `);

    stmt.run(passwordHash, userId);

    return {
      success: true,
      message: "Contraseña cambiada exitosamente",
    };
  } catch (error) {
    console.error("Error changing password:", error);
    throw new Error(error.message || "Error al cambiar contraseña");
  }
});