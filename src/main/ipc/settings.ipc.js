const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * Handler para obtener todas las configuraciones
 */
ipcMain.handle("settings:getAll", async () => {
  try {
    const stmt = db.prepare(`SELECT * FROM settings`);
    const rows = stmt.all();
    
    // Convertir array de {key, value} a objeto
    const settings = {};
    rows.forEach((row) => {
      settings[row.key] = row.value;
    });
    
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw new Error("Error al obtener configuración");
  }
});

/**
 * Handler para obtener una configuración específica
 */
ipcMain.handle("settings:get", async (event, key) => {
  try {
    const stmt = db.prepare(`SELECT value FROM settings WHERE key = ?`);
    const row = stmt.get(key);
    return row ? row.value : null;
  } catch (error) {
    console.error("Error fetching setting:", error);
    throw new Error("Error al obtener configuración");
  }
});

/**
 * Handler para guardar una configuración
 */
ipcMain.handle("settings:set", async (event, key, value) => {
  try {
    const stmt = db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `);
    
    stmt.run(key, value || "");
    return { success: true };
  } catch (error) {
    console.error("Error saving setting:", error);
    throw new Error("Error al guardar configuración");
  }
});

/**
 * Handler para guardar múltiples configuraciones a la vez
 */
ipcMain.handle("settings:setAll", async (event, settings) => {
  try {
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
    console.error("Error saving settings:", error);
    throw new Error("Error al guardar configuración");
  }
});

/**
 * Handler para obtener configuración de empresa (datos para tickets)
 */
ipcMain.handle("settings:getCompany", async () => {
  try {
    const stmt = db.prepare(`
      SELECT key, value FROM settings 
      WHERE key IN ('company_name', 'company_rfc', 'company_phone', 'company_address', 'company_email', 'company_website')
    `);
    const rows = stmt.all();
    
    const company = {
      name: null,
      rfc: null,
      phone: null,
      address: null,
      email: null,
      website: null,
    };
    
    rows.forEach((row) => {
      const key = row.key.replace("company_", "");
      company[key] = row.value;
    });
    
    return company;
  } catch (error) {
    console.error("Error fetching company settings:", error);
    throw new Error("Error al obtener datos de empresa");
  }
});
