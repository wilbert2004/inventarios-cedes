const crypto = require('crypto');
const os = require('os');
const db = require('../db/connection');

/**
 * Clave secreta para generar licencias
 * En producción, esta clave debe ser diferente y segura
 * Esta clave permite al desarrollador generar licencias válidas
 */
const LICENSE_SECRET = 'ABSOLUTE_POS_SECRET_KEY_2024_CHANGE_IN_PRODUCTION';

/**
 * Genera un hardware fingerprint único para esta instalación
 * Combina información del sistema para crear un ID único
 */
function generateHardwareId() {
  const components = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.totalmem().toString(),
    os.cpus().length.toString(),
  ];

  const combined = components.join('|');
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  
  // Tomar los primeros 32 caracteres para un ID más corto
  return hash.substring(0, 32).toUpperCase();
}

/**
 * Genera una licencia basada en el hardware ID
 * El desarrollador puede usar esta función para generar licencias
 */
function generateLicenseKey(hardwareId) {
  if (!hardwareId) {
    throw new Error('Hardware ID es requerido');
  }

  // Combinar hardware ID con secreto y generar hash
  const combined = `${hardwareId}|${LICENSE_SECRET}`;
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  
  // Formatear como clave de licencia (8-4-4-4-12)
  const formatted = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    hash.substring(12, 16),
    hash.substring(16, 20),
    hash.substring(20, 32),
  ].join('-').toUpperCase();

  return formatted;
}

/**
 * Verifica si una licencia es válida para un hardware ID dado
 */
function verifyLicense(licenseKey, hardwareId) {
  if (!licenseKey || !hardwareId) {
    return false;
  }

  // Generar la licencia esperada para este hardware ID
  const expectedLicense = generateLicenseKey(hardwareId);
  
  // Comparar (case-insensitive)
  return expectedLicense.toUpperCase() === licenseKey.toUpperCase();
}

/**
 * Obtiene o crea el hardware ID de esta instalación
 */
function getOrCreateHardwareId() {
  let licenseRecord = db.prepare('SELECT * FROM license LIMIT 1').get();

  if (!licenseRecord) {
    // Primera instalación - crear registro
    const hardwareId = generateHardwareId();
    const now = new Date().toISOString();
    const demoExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO license (hardware_id, installation_date, first_access_date, demo_expires_at)
      VALUES (?, ?, ?, ?)
    `).run(hardwareId, now, now, demoExpiresAt);

    licenseRecord = db.prepare('SELECT * FROM license LIMIT 1').get();
  } else if (!licenseRecord.first_access_date) {
    // Actualizar first_access_date si no existe
    const now = new Date().toISOString();
    const demoExpiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    
    db.prepare(`
      UPDATE license 
      SET first_access_date = ?, demo_expires_at = ?
      WHERE id = ?
    `).run(now, demoExpiresAt, licenseRecord.id);

    licenseRecord = db.prepare('SELECT * FROM license WHERE id = ?').get(licenseRecord.id);
  }

  return licenseRecord.hardware_id;
}

/**
 * Obtiene el estado de la licencia
 */
function getLicenseStatus() {
  const licenseRecord = db.prepare('SELECT * FROM license LIMIT 1').get();

  if (!licenseRecord) {
    // Primera vez - inicializar
    const hardwareId = getOrCreateHardwareId();
    return getLicenseStatus();
  }

  const now = new Date();
  let demoExpiresAt = null;
  
  if (licenseRecord.demo_expires_at) {
    try {
      demoExpiresAt = new Date(licenseRecord.demo_expires_at);
      // Validar que la fecha sea válida
      if (isNaN(demoExpiresAt.getTime())) {
        demoExpiresAt = null;
      }
    } catch (error) {
      demoExpiresAt = null;
    }
  }
  
  const isActivated = !!licenseRecord.license_key && !!licenseRecord.activated_at;
  const isDemoExpired = demoExpiresAt ? now > demoExpiresAt : false;
  const isDemoActive = !isActivated && !isDemoExpired && demoExpiresAt;

  // Calcular días restantes de demo
  let daysRemaining = 0;
  if (isDemoActive && demoExpiresAt) {
    const diff = demoExpiresAt.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return {
    hardwareId: licenseRecord.hardware_id,
    isActivated,
    isDemoActive,
    isDemoExpired,
    daysRemaining,
    activatedAt: licenseRecord.activated_at,
    demoExpiresAt: licenseRecord.demo_expires_at,
    installationDate: licenseRecord.installation_date,
    firstAccessDate: licenseRecord.first_access_date,
  };
}

/**
 * Activa una licencia
 */
function activateLicense(licenseKey) {
  const hardwareId = getOrCreateHardwareId();

  if (!verifyLicense(licenseKey, hardwareId)) {
    throw new Error('Licencia inválida para esta instalación');
  }

  const now = new Date().toISOString();

  // Verificar si ya existe un registro
  const existing = db.prepare('SELECT * FROM license WHERE hardware_id = ?').get(hardwareId);

  if (existing && existing.license_key) {
    // Ya está activada
    if (existing.license_key.toUpperCase() === licenseKey.toUpperCase()) {
      return { success: true, message: 'La licencia ya está activada' };
    } else {
      throw new Error('Esta instalación ya tiene una licencia diferente activada');
    }
  }

  // Activar licencia
  if (existing) {
    db.prepare(`
      UPDATE license 
      SET license_key = ?, activated_at = ?, updated_at = ?
      WHERE hardware_id = ?
    `).run(licenseKey.toUpperCase(), now, now, hardwareId);
  } else {
    db.prepare(`
      INSERT INTO license (hardware_id, license_key, activated_at)
      VALUES (?, ?, ?)
    `).run(hardwareId, licenseKey.toUpperCase(), now);
  }

  return { success: true, message: 'Licencia activada correctamente' };
}

/**
 * Obtiene el hardware ID para que el desarrollador pueda generar la licencia
 * Esta función debe ser accesible para el desarrollador
 */
function getHardwareIdForDeveloper() {
  return getOrCreateHardwareId();
}

module.exports = {
  generateHardwareId,
  generateLicenseKey,
  verifyLicense,
  getOrCreateHardwareId,
  getLicenseStatus,
  activateLicense,
  getHardwareIdForDeveloper,
  LICENSE_SECRET, // Exportar para uso del desarrollador
};
