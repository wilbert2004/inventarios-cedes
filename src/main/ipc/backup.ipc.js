const { ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const db = require("../db/connection");
const { getDatabasePath, getBackupDirectory } = require("../utils/paths");

/**
 * Obtener la ruta de la base de datos
 */
function getDbPath() {
  return getDatabasePath();
}

/**
 * Obtener la ruta del directorio de respaldos
 */
function getBackupDir() {
  const backupDir = getBackupDirectory();
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

/**
 * Handler para crear respaldo manual
 */
ipcMain.handle("backup:create", async (event, customPath = null) => {
  try {
    const dbPath = getDbPath();
    
    // Verificar que la base de datos existe
    if (!fs.existsSync(dbPath)) {
      throw new Error("La base de datos no existe");
    }

    // Generar nombre de archivo con fecha y hora
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const defaultFileName = `pos-backup-${timestamp}.db`;

    let backupPath;

    if (customPath) {
      // Usar ruta personalizada proporcionada por el usuario
      backupPath = customPath;
    } else {
      // Usar directorio de respaldos por defecto
      const backupDir = getBackupDir();
      backupPath = path.join(backupDir, defaultFileName);
    }

    // Copiar archivo de base de datos
    fs.copyFileSync(dbPath, backupPath);

    // También copiar archivos WAL si existen
    const walPath = dbPath + "-wal";
    const shmPath = dbPath + "-shm";
    
    if (fs.existsSync(walPath)) {
      fs.copyFileSync(walPath, backupPath + "-wal");
    }
    if (fs.existsSync(shmPath)) {
      fs.copyFileSync(shmPath, backupPath + "-shm");
    }

    return {
      success: true,
      path: backupPath,
      size: fs.statSync(backupPath).size,
      timestamp: now.toISOString(),
    };
  } catch (error) {
    console.error("Error creating backup:", error);
    throw new Error(`Error al crear respaldo: ${error.message}`);
  }
});

/**
 * Handler para restaurar respaldo
 */
ipcMain.handle("backup:restore", async (event, backupPath) => {
  try {
    const dbPath = getDbPath();
    const dbDir = path.dirname(dbPath);

    // Verificar que el respaldo existe
    if (!fs.existsSync(backupPath)) {
      throw new Error("El archivo de respaldo no existe");
    }

    // No cerrar la conexión aquí, se cerrará automáticamente al reiniciar
    // db.close(); // Comentado para evitar problemas

    // Crear respaldo de la BD actual antes de restaurar
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const currentBackupPath = path.join(
      getBackupDir(),
      `pos-before-restore-${timestamp}.db`
    );
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, currentBackupPath);
    }

    // Restaurar el respaldo
    fs.copyFileSync(backupPath, dbPath);

    // Restaurar archivos WAL si existen
    const walBackup = backupPath + "-wal";
    const shmBackup = backupPath + "-shm";
    const walPath = dbPath + "-wal";
    const shmPath = dbPath + "-shm";

    if (fs.existsSync(walBackup)) {
      fs.copyFileSync(walBackup, walPath);
    } else if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }

    if (fs.existsSync(shmBackup)) {
      fs.copyFileSync(shmBackup, shmPath);
    } else if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }

    return {
      success: true,
      message: "Respaldo restaurado exitosamente. Reinicia la aplicación.",
    };
  } catch (error) {
    console.error("Error restoring backup:", error);
    throw new Error(`Error al restaurar respaldo: ${error.message}`);
  }
});

/**
 * Handler para listar respaldos disponibles
 */
ipcMain.handle("backup:list", async () => {
  try {
    const backupDir = getBackupDir();
    
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter((file) => file.endsWith(".db") && file.startsWith("pos-backup-"))
      .map((file) => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime.toISOString(),
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    return backups;
  } catch (error) {
    console.error("Error listing backups:", error);
    throw new Error("Error al listar respaldos");
  }
});

/**
 * Handler para eliminar respaldo
 */
ipcMain.handle("backup:delete", async (event, backupPath) => {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error("El archivo de respaldo no existe");
    }

    fs.unlinkSync(backupPath);

    // Eliminar archivos relacionados si existen
    const walPath = backupPath + "-wal";
    const shmPath = backupPath + "-shm";
    
    if (fs.existsSync(walPath)) {
      fs.unlinkSync(walPath);
    }
    if (fs.existsSync(shmPath)) {
      fs.unlinkSync(shmPath);
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting backup:", error);
    throw new Error(`Error al eliminar respaldo: ${error.message}`);
  }
});

/**
 * Handler para abrir diálogo de selección de archivo para respaldo
 */
ipcMain.handle("backup:selectFile", async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: "Seleccionar archivo de respaldo",
      filters: [
        { name: "Base de datos SQLite", extensions: ["db"] },
        { name: "Todos los archivos", extensions: ["*"] },
      ],
      properties: ["openFile"],
    });

    if (result.canceled) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    console.error("Error selecting backup file:", error);
    throw new Error("Error al seleccionar archivo");
  }
});

/**
 * Handler para abrir diálogo de guardado para respaldo
 */
ipcMain.handle("backup:saveDialog", async () => {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const defaultFileName = `pos-backup-${timestamp}.db`;

    const result = await dialog.showSaveDialog({
      title: "Guardar respaldo",
      defaultPath: defaultFileName,
      filters: [
        { name: "Base de datos SQLite", extensions: ["db"] },
        { name: "Todos los archivos", extensions: ["*"] },
      ],
    });

    if (result.canceled) {
      return null;
    }

    return result.filePath;
  } catch (error) {
    console.error("Error in save dialog:", error);
    throw new Error("Error al abrir diálogo de guardado");
  }
});

/**
 * Handler para validar integridad de la base de datos
 */
ipcMain.handle("backup:validateIntegrity", async () => {
  try {
    // Verificar integridad usando PRAGMA integrity_check
    const result = db.prepare("PRAGMA integrity_check").get();
    
    if (result.integrity_check === "ok") {
      return {
        valid: true,
        message: "La base de datos está íntegra",
      };
    } else {
      return {
        valid: false,
        message: result.integrity_check || "Error de integridad detectado",
      };
    }
  } catch (error) {
    console.error("Error validating integrity:", error);
    return {
      valid: false,
      message: `Error al validar integridad: ${error.message}`,
    };
  }
});

/**
 * Handler para obtener información de la base de datos
 */
ipcMain.handle("backup:getDbInfo", async () => {
  try {
    const dbPath = getDbPath();
    
    if (!fs.existsSync(dbPath)) {
      return {
        exists: false,
        path: dbPath,
      };
    }

    const stats = fs.statSync(dbPath);
    const integrity = db.prepare("PRAGMA integrity_check").get();

    return {
      exists: true,
      path: dbPath,
      size: stats.size,
      created: stats.birthtime.toISOString(),
      modified: stats.mtime.toISOString(),
      integrity: integrity.integrity_check === "ok",
    };
  } catch (error) {
    console.error("Error getting DB info:", error);
    throw new Error("Error al obtener información de la base de datos");
  }
});
