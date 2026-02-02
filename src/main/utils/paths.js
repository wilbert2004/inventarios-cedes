const path = require('path');
const { app } = require('electron');

/**
 * Utilidades para gestionar rutas de datos según el entorno
 * - Desarrollo: usa una subcarpeta "dev" para evitar conflictos
 * - Producción: usa la ruta estándar de userData
 */

/**
 * Determina si la aplicación está en modo desarrollo
 */
function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !app.isPackaged;
}

/**
 * Obtiene el directorio base para los datos de la aplicación
 * En desarrollo: userData/dev
 * En producción: userData
 */
function getDataDirectory() {
  const basePath = app.getPath('userData');
  if (isDevelopment()) {
    return path.join(basePath, 'dev');
  }
  return basePath;
}

/**
 * Obtiene la ruta completa de la base de datos
 */
function getDatabasePath() {
  return path.join(getDataDirectory(), 'pos.db');
}

/**
 * Obtiene el directorio de backups
 */
function getBackupDirectory() {
  return path.join(getDataDirectory(), 'backups');
}

module.exports = {
  isDevelopment,
  getDataDirectory,
  getDatabasePath,
  getBackupDirectory,
};
