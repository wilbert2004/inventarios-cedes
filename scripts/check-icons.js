#!/usr/bin/env node

/**
 * Script para verificar que los iconos de la aplicación estén presentes
 * Uso: node scripts/check-icons.js
 */

const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const requiredIcons = {
  windows: 'icon.ico',
  macos: 'icon.icns',
  linux: 'icon.png',
};

console.log('\n🔍 Verificando iconos de la aplicación...\n');

// Verificar si existe la carpeta build
if (!fs.existsSync(buildDir)) {
  console.log('❌ La carpeta "build" no existe.');
  console.log('📁 Creando carpeta build...');
  fs.mkdirSync(buildDir, { recursive: true });
  console.log('✅ Carpeta "build" creada.\n');
}

let allPresent = true;
const platform = process.platform;

// Verificar cada icono
Object.entries(requiredIcons).forEach(([platformName, iconFile]) => {
  const iconPath = path.join(buildDir, iconFile);
  const exists = fs.existsSync(iconPath);
  
  if (exists) {
    const stats = fs.statSync(iconPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`✅ ${iconFile} (${platformName}) - ${sizeKB} KB`);
  } else {
    console.log(`❌ ${iconFile} (${platformName}) - NO ENCONTRADO`);
    allPresent = false;
  }
});

console.log('\n' + '─'.repeat(50) + '\n');

if (allPresent) {
  console.log('✅ Todos los iconos están presentes.');
  console.log('🚀 Puedes ejecutar "npm run make" para construir la aplicación con tus iconos.\n');
} else {
  console.log('⚠️  Faltan algunos iconos.');
  console.log('\n📝 Para agregar tus iconos:');
  console.log('   1. Prepara tu logo en formato PNG (1024x1024 píxeles recomendado)');
  console.log('   2. Convierte a los formatos requeridos:');
  console.log('      - Windows: .ico (múltiples tamaños: 16, 32, 48, 256)');
  console.log('      - macOS: .icns (múltiples tamaños: 16, 32, 128, 256, 512, 1024)');
  console.log('      - Linux: .png (512x512 o 256x256)');
  console.log('   3. Coloca los archivos en la carpeta "build/"');
  console.log('\n💡 Herramientas recomendadas:');
  console.log('   - Windows ICO: https://convertio.co/png-ico/');
  console.log('   - macOS ICNS: https://cloudconvert.com/png-to-icns');
  console.log('   - Linux PNG: Usa tu PNG original o redimensiona a 512x512\n');
  
  // Verificar si existe el logo original
  const originalLogo = path.join(__dirname, '..', 'src', 'assets', 'absolute.png');
  if (fs.existsSync(originalLogo)) {
    console.log('📸 Logo original encontrado en: src/assets/absolute.png');
    console.log('   Puedes usar este archivo como base para crear los iconos.\n');
  }
}

process.exit(allPresent ? 0 : 1);
