const { ipcMain } = require("electron");
const printerService = require("../services/printer.service");
const db = require("../db/connection");

/**
 * Handler para imprimir un ticket
 */
ipcMain.handle("printer:printTicket", async (event, saleData) => {
  try {
    await printerService.printTicket(saleData);
    return { success: true };
  } catch (error) {
    console.error("Error printing ticket:", error);
    throw new Error(error.message || "Error al imprimir ticket");
  }
});

/**
 * Handler para obtener impresoras disponibles
 */
ipcMain.handle("printer:getPrinters", async () => {
  try {
    const printers = await printerService.getPrinters();
    return printers;
  } catch (error) {
    console.error("Error getting printers:", error);
    throw new Error("Error al obtener impresoras");
  }
});

/**
 * Handler para obtener configuración de impresora
 */
ipcMain.handle("printer:getConfig", async () => {
  try {
    const stmt = db.prepare(`
      SELECT key, value FROM settings 
      WHERE key IN ('printer_name', 'printer_paper_size', 'printer_copies', 'printer_silent', 'printer_color', 'printer_margin_top', 'printer_margin_bottom', 'printer_margin_left', 'printer_margin_right')
    `);
    const rows = stmt.all();
    
    const config = {
      printerName: null,
      paperSize: "Letter", // Default
      copies: 1,
      silent: false,
      color: false,
      margins: {
        top: 5,
        bottom: 5,
        left: 5,
        right: 5,
      },
    };
    
    rows.forEach((row) => {
      const key = row.key.replace("printer_", "");
      switch (key) {
        case "name":
          config.printerName = row.value || null;
          break;
        case "paper_size":
          config.paperSize = row.value || "Letter";
          break;
        case "copies":
          config.copies = parseInt(row.value) || 1;
          break;
        case "silent":
          config.silent = row.value === "true";
          break;
        case "color":
          config.color = row.value === "true";
          break;
        case "margin_top":
          config.margins.top = parseInt(row.value) || 5;
          break;
        case "margin_bottom":
          config.margins.bottom = parseInt(row.value) || 5;
          break;
        case "margin_left":
          config.margins.left = parseInt(row.value) || 5;
          break;
        case "margin_right":
          config.margins.right = parseInt(row.value) || 5;
          break;
      }
    });
    
    return config;
  } catch (error) {
    console.error("Error getting printer config:", error);
    throw new Error("Error al obtener configuración de impresora");
  }
});

/**
 * Handler para guardar configuración de impresora
 */
ipcMain.handle("printer:saveConfig", async (event, config) => {
  try {
    const settings = {
      printer_name: config.printerName || "",
      printer_paper_size: config.paperSize || "Letter",
      printer_copies: (config.copies || 1).toString(),
      printer_silent: (config.silent || false).toString(),
      printer_color: (config.color || false).toString(),
      printer_margin_top: (config.margins?.top || 5).toString(),
      printer_margin_bottom: (config.margins?.bottom || 5).toString(),
      printer_margin_left: (config.margins?.left || 5).toString(),
      printer_margin_right: (config.margins?.right || 5).toString(),
    };
    
    const result = db.transaction(() => {
      const stmt = db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, datetime('now'))
        ON CONFLICT(key) DO UPDATE SET
          value = excluded.value,
          updated_at = datetime('now')
      `);
      
      Object.entries(settings).forEach(([key, value]) => {
        stmt.run(key, value || "");
      });
      
      return { success: true };
    })();
    
    return result;
  } catch (error) {
    console.error("Error saving printer config:", error);
    throw new Error("Error al guardar configuración de impresora");
  }
});
