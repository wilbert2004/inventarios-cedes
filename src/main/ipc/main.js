const { app, BrowserWindow } = require("electron");
const path = require("path");

require("./products.ipc");
require("./sales.ipc");
require("./reports.ipc");
require("./users.ipc");
require("./inventory.ipc");
require("./backup.ipc");
require("./license.ipc");
require("./printer.ipc");
require("./settings.ipc");
require("./custody.ipc");
require("./custody-lifecycle.ipc"); // Módulo de Registro y Resguardo
require("./shell.ipc"); // Shell commands

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "../preload/preload.js"),
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);
