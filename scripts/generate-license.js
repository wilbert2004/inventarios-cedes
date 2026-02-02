#!/usr/bin/env node

/**
 * Script para generar licencias
 * Uso: node scripts/generate-license.js <hardware-id>
 * 
 * Este script permite al desarrollador generar una licencia válida
 * para un hardware ID específico.
 */

const crypto = require('crypto');

// Clave secreta (debe coincidir con la del servicio)
const LICENSE_SECRET = 'ABSOLUTE_POS_SECRET_KEY_2024_CHANGE_IN_PRODUCTION';

/**
 * Genera una licencia basada en el hardware ID
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

// Obtener hardware ID de los argumentos
const hardwareId = process.argv[2];

if (!hardwareId) {
  console.error('❌ Error: Hardware ID es requerido');
  console.log('\nUso:');
  console.log('  node scripts/generate-license.js <hardware-id>');
  console.log('\nEjemplo:');
  console.log('  node scripts/generate-license.js A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6');
  process.exit(1);
}

try {
  const licenseKey = generateLicenseKey(hardwareId);
  
  console.log('\n✅ Licencia generada exitosamente\n');
  console.log('Hardware ID:');
  console.log(`  ${hardwareId}\n`);
  console.log('Clave de Licencia:');
  console.log(`  ${licenseKey}\n`);
  console.log('─────────────────────────────────────────\n');
} catch (error) {
  console.error('❌ Error al generar licencia:', error.message);
  process.exit(1);
}
