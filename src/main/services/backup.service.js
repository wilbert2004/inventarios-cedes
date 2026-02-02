const fs = require("fs");
const path = require("path");
const { getDatabasePath, getBackupDirectory } = require("../utils/paths");

/**
 * Servicio para respaldos automáticos
 */
class BackupService {
  constructor() {
    this.backupInterval = null;
    this.lastBackupDate = null;
  }

  /**
   * Obtener ruta de la base de datos
   */
  getDbPath() {
    return getDatabasePath();
  }

  /**
   * Obtener directorio de respaldos
   */
  getBackupDir() {
    const backupDir = getBackupDirectory();
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
  }

  /**
   * Crear respaldo automático
   */
  createAutomaticBackup() {
    try {
      const dbPath = this.getDbPath();
      
      if (!fs.existsSync(dbPath)) {
        console.log("No hay base de datos para respaldar");
        return null;
      }

      const backupDir = this.getBackupDir();
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const backupFileName = `pos-backup-auto-${timestamp}.db`;
      const backupPath = path.join(backupDir, backupFileName);

      // Copiar base de datos
      fs.copyFileSync(dbPath, backupPath);

      // Copiar archivos WAL si existen
      const walPath = dbPath + "-wal";
      const shmPath = dbPath + "-shm";
      
      if (fs.existsSync(walPath)) {
        fs.copyFileSync(walPath, backupPath + "-wal");
      }
      if (fs.existsSync(shmPath)) {
        fs.copyFileSync(shmPath, backupPath + "-shm");
      }

      // Limpiar respaldos antiguos (mantener solo los últimos 7 días)
      this.cleanOldBackups();

      console.log(`✓ Respaldo automático creado: ${backupFileName}`);
      this.lastBackupDate = now;

      return backupPath;
    } catch (error) {
      console.error("Error creating automatic backup:", error);
      return null;
    }
  }

  /**
   * Limpiar respaldos antiguos (mantener solo los últimos 7 días)
   */
  cleanOldBackups() {
    try {
      const backupDir = this.getBackupDir();
      if (!fs.existsSync(backupDir)) {
        return;
      }

      const files = fs.readdirSync(backupDir);
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

      files.forEach((file) => {
        if (file.startsWith("pos-backup-auto-") && file.endsWith(".db")) {
          const filePath = path.join(backupDir, file);
          try {
            const stats = fs.statSync(filePath);
            
            if (stats.mtime.getTime() < sevenDaysAgo) {
              fs.unlinkSync(filePath);
              // Eliminar archivos relacionados
              const walPath = filePath + "-wal";
              const shmPath = filePath + "-shm";
              if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
              if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
              console.log(`✓ Respaldo antiguo eliminado: ${file}`);
            }
          } catch (err) {
            console.error(`Error al procesar archivo ${file}:`, err);
          }
        }
      });
    } catch (error) {
      console.error("Error cleaning old backups:", error);
    }
  }

  /**
   * Verificar si necesita crear respaldo hoy
   */
  needsBackupToday() {
    if (!this.lastBackupDate) {
      return true;
    }

    const today = new Date();
    const lastBackup = new Date(this.lastBackupDate);

    return (
      today.getDate() !== lastBackup.getDate() ||
      today.getMonth() !== lastBackup.getMonth() ||
      today.getFullYear() !== lastBackup.getFullYear()
    );
  }

  /**
   * Iniciar servicio de respaldos automáticos
   */
  start() {
    // Crear respaldo inicial si no se ha creado hoy
    if (this.needsBackupToday()) {
      this.createAutomaticBackup();
    }

    // Verificar cada hora si necesita crear respaldo
    this.backupInterval = setInterval(() => {
      if (this.needsBackupToday()) {
        this.createAutomaticBackup();
      }
    }, 60 * 60 * 1000); // Cada hora

    console.log("✓ Servicio de respaldos automáticos iniciado");
  }

  /**
   * Detener servicio de respaldos
   */
  stop() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }
}

module.exports = new BackupService();
