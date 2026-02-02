const { ipcMain } = require("electron");
const licenseService = require("../services/license.service");

/**
 * Handler para obtener el estado de la licencia
 */
ipcMain.handle("license:getStatus", async () => {
  try {
    return licenseService.getLicenseStatus();
  } catch (error) {
    console.error("Error getting license status:", error);
    throw new Error("Error al obtener estado de licencia");
  }
});

/**
 * Handler para activar una licencia
 */
ipcMain.handle("license:activate", async (event, licenseKey) => {
  try {
    return licenseService.activateLicense(licenseKey);
  } catch (error) {
    console.error("Error activating license:", error);
    throw error; // Re-lanzar para que el frontend pueda mostrar el mensaje específico
  }
});

/**
 * Handler para obtener el hardware ID (para el desarrollador)
 * Esto permite al desarrollador saber qué clave necesita cada instalación
 */
ipcMain.handle("license:getHardwareId", async () => {
  try {
    const hardwareId = licenseService.getHardwareIdForDeveloper();
    return { hardwareId };
  } catch (error) {
    console.error("Error getting hardware ID:", error);
    throw new Error("Error al obtener hardware ID");
  }
});

/**
 * Handler para generar una licencia (solo para desarrollo/testing)
 * En producción, esto debería estar deshabilitado o protegido
 */
ipcMain.handle("license:generate", async () => {
  try {
    const hardwareId = licenseService.getHardwareIdForDeveloper();
    const licenseKey = licenseService.generateLicenseKey(hardwareId);
    return { hardwareId, licenseKey };
  } catch (error) {
    console.error("Error generating license:", error);
    throw new Error("Error al generar licencia");
  }
});
