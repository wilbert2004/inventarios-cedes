const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    // Configurar icono de la aplicación
    // Electron Forge buscará automáticamente:
    // - build/icon.ico (Windows)
    // - build/icon.icns (macOS)
    // - build/icon.png (Linux)
    icon: path.resolve(__dirname, 'build', 'icon'),
    // Asegurar que better-sqlite3 se desempaquete del asar
    // El plugin-auto-unpack-natives maneja esto automáticamente,
    // pero también podemos ser explícitos con asarUnpack
    asarUnpack: [
      '**/node_modules/better-sqlite3/**',
      '**/node_modules/better-sqlite3/**/*',
    ],
    // No ignorar .vite/main ni .vite/build - estos son necesarios
    // Solo ignorar archivos de desarrollo
    ignore: [
      /^\/src(?![\/\\]node_modules)/,
      /^\/\.vite\/build\/src/,
      /^\/webpack/,
      /^\/\.git/,
      /^\/node_modules\/\.cache/,
    ],
  },
  rebuildConfig: {
    // Asegurar que better-sqlite3 se recompile para la versión correcta de Electron
    // Si el proceso se cuelga, ejecuta manualmente: npx electron-rebuild --only better-sqlite3
    onlyModules: ['better-sqlite3'],
    force: false,
    // Desactivar rebuild durante packaging si causa problemas
    // Se puede hacer manualmente antes con: npx electron-rebuild
  },
  makers: [
    // Maker de Squirrel para generar instalador .exe en Windows
    { 
      name: '@electron-forge/maker-squirrel', 
      config: {
        // Opcional: configurar certificado para firmar el instalador
        // certificateFile: './cert.pfx',
        // certificatePassword: process.env.CERTIFICATE_PASSWORD,
        // Configuración adicional para Squirrel
        setupExe: 'absolute-pos-app-Setup.exe',
        // Icono del instalador (usa el mismo icono de la app)
        setupIcon: path.resolve(__dirname, 'build', 'icon.ico'),
      }
    },
    // ZIP como alternativa (opcional)
    { 
      name: '@electron-forge/maker-zip', 
      platforms: ['darwin'] 
    },
    { name: '@electron-forge/maker-deb', config: {} },
    { name: '@electron-forge/maker-rpm', config: {} },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-fuses',
      config: {
        version: FuseVersion.V1,
        [FuseV1Options.RunAsNode]: false,
        [FuseV1Options.EnableCookieEncryption]: true,
        [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
        [FuseV1Options.EnableNodeCliInspectArguments]: false,
        [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
        [FuseV1Options.OnlyLoadAppFromAsar]: true,
      },
    },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        // Construir el main process también con Vite para que el plugin funcione correctamente
        // El main se construirá en .vite/main/main.js
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.js',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.js',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.config.js',
          },
        ],
      },
    },
  ],
};

