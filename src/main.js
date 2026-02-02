const { app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron');
const path = require('node:path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// electron-squirrel-startup puede no estar disponible en todos los contextos
try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch (error) {
  // Si el módulo no está disponible, continuar normalmente
  // Esto puede pasar en desarrollo o si el módulo no se copió correctamente
  console.log('electron-squirrel-startup not available, continuing...');
}

// Inicializar base de datos
const db = require('./main/db/connection');
require('./main/db/migrations');

// Limpiar usuarios regulares al iniciar
const { cleanupRegularUsers } = require('./main/cleanup-users');
cleanupRegularUsers();

// Validar integridad de la base de datos al iniciar
try {
  const integrityCheck = db.prepare("PRAGMA integrity_check").get();
  if (integrityCheck.integrity_check !== "ok") {
    console.error("⚠️ ADVERTENCIA: La base de datos puede estar corrupta");
    console.error("Resultado de integridad:", integrityCheck.integrity_check);
    console.error("Se recomienda restaurar desde un respaldo");
  } else {
    console.log("✓ Integridad de la base de datos verificada");
  }
} catch (error) {
  console.error("Error verificando integridad de BD:", error);
}

// Cargar handlers IPC
require('./main/ipc/users.ipc');
require('./main/ipc/products.ipc');
require('./main/ipc/sales.ipc');
require('./main/ipc/inventory.ipc');
require('./main/ipc/printer.ipc');
require('./main/ipc/reports.ipc');
require('./main/ipc/settings.ipc');
require('./main/ipc/backup.ipc');
require('./main/ipc/license.ipc');
require('./main/ipc/custody.ipc');
require('./main/ipc/custody-products.ipc');
require('./main/ipc/custody-lifecycle.ipc');

// Iniciar servicio de respaldos automáticos
const backupService = require('./main/services/backup.service');

let mainWindow = null;
let powerSaveBlockerId = null;

const createWindow = () => {
  // Create the browser window.
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

  let preloadPath;

  // Intentar usar variables de entorno que el plugin puede inyectar
  if (process.env.MAIN_WINDOW_PRELOAD_VITE_ENTRY) {
    preloadPath = process.env.MAIN_WINDOW_PRELOAD_VITE_ENTRY;
  } else if (isDev) {
    // En desarrollo, el main.js está en .vite/main/main.js
    // Necesitamos ir a la raíz del proyecto (dos niveles arriba)
    // y luego a .vite/build/preload.js
    const projectRoot = path.resolve(__dirname, '../..');
    preloadPath = path.join(projectRoot, '.vite', 'build', 'preload.js');
  } else {
    // En producción, usar app.getAppPath() para obtener la ruta correcta
    // El plugin de Vite coloca los archivos en la raíz de la app
    const appPath = app.getAppPath();
    preloadPath = path.join(appPath, '.vite', 'build', 'preload.js');
  }

  console.log('Preload path:', preloadPath);
  console.log('Is dev:', isDev);
  console.log('Process env:', {
    NODE_ENV: process.env.NODE_ENV,
    VITE_DEV_SERVER_URL: process.env.VITE_DEV_SERVER_URL,
  });

  // Ruta del icono de la aplicación
  // En Windows y macOS, el icono se configura en packagerConfig.icon
  // Aquí configuramos el icono de la ventana (útil principalmente en Linux)
  let iconPath;
  const fs = require('fs');

  if (isDev) {
    // En desarrollo, buscar el icono en build/
    const projectRoot = path.resolve(__dirname, '../..');
    const possiblePaths = [
      path.join(projectRoot, 'build', 'icon.png'),
      path.join(projectRoot, 'build', 'icon.ico'),
      path.join(projectRoot, 'build', 'icon.icns'),
    ];

    // Usar el primer icono que exista
    iconPath = possiblePaths.find(p => fs.existsSync(p));
  } else {
    // En producción, el icono está embebido en el ejecutable
    // No necesitamos especificarlo aquí
    iconPath = undefined;
  }

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    ...(iconPath && { icon: iconPath }), // Solo agregar icon si existe
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Necesario para que el preload funcione correctamente
    },
  });

  // Prevenir que la pantalla se apague cuando la ventana esté visible
  mainWindow.on('show', () => {
    if (powerSaveBlockerId === null) {
      // 'prevent-display-sleep' previene que la pantalla se apague
      // pero permite que el sistema entre en suspensión si es necesario
      powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
      console.log('✓ Bloqueador de suspensión activado (ID:', powerSaveBlockerId, ')');
    }
  });

  // Opcional: Detener el bloqueador cuando la ventana se oculta
  // Para un POS, es mejor mantenerlo siempre activo, pero lo dejamos opcional
  mainWindow.on('hide', () => {
    // Comentado: mantener activo incluso cuando está oculto
    // if (powerSaveBlockerId !== null) {
    //   powerSaveBlocker.stop(powerSaveBlockerId);
    //   powerSaveBlockerId = null;
    //   console.log('Bloqueador de suspensión desactivado');
    // }
  });

  // and load the index.html of the app.
  if (isDev) {
    // En desarrollo, el plugin de Vite inyecta VITE_DEV_SERVER_URL
    const viteDevServer = process.env.VITE_DEV_SERVER_URL;
    if (viteDevServer) {
      mainWindow.loadURL(viteDevServer);
    } else {
      // Fallback: cargar desde el servidor de desarrollo de Vite
      mainWindow.loadURL('http://localhost:5173');
    }
    // Open the DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    // En producción, el plugin de Vite construye en .vite/build
    // __dirname apunta a donde está main.js (dentro del asar o fuera)
    // El plugin de Vite coloca los archivos en la raíz de la app
    const appPath = app.getAppPath();
    const indexPath = path.join(appPath, '.vite', 'build', 'index.html');
    mainWindow.loadFile(indexPath);
  }
};

// Handler para forzar el foco de la ventana
ipcMain.handle('window:focus', () => {
  if (mainWindow) {
    mainWindow.focus();
    mainWindow.show();
    return true;
  }
  return false;
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Iniciar servicio de respaldos automáticos
  backupService.start();

  // Activar bloqueador de suspensión inmediatamente después de crear la ventana
  // Esto asegura que la pantalla no se apague desde el inicio
  if (mainWindow && mainWindow.isVisible()) {
    if (powerSaveBlockerId === null) {
      powerSaveBlockerId = powerSaveBlocker.start('prevent-display-sleep');
      console.log('✓ Bloqueador de suspensión activado al iniciar (ID:', powerSaveBlockerId, ')');
    }
  }

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Detener servicio de respaldos y bloqueador de suspensión al cerrar
app.on('before-quit', () => {
  backupService.stop();

  // Detener el bloqueador de suspensión
  if (powerSaveBlockerId !== null) {
    powerSaveBlocker.stop(powerSaveBlockerId);
    powerSaveBlockerId = null;
    console.log('✓ Bloqueador de suspensión desactivado');
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
