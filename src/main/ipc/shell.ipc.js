const { ipcMain, shell } = require("electron");

/**
 * Abre un archivo con la aplicación predeterminada del sistema
 */
ipcMain.handle("shell:openPath", async (event, filePath) => {
    try {
        console.log('Abriendo archivo:', filePath);
        const result = await shell.openPath(filePath);

        if (result) {
            // Si hay un error, openPath devuelve un string con el mensaje
            console.error('Error abriendo archivo:', result);
            return { success: false, error: result };
        }

        return { success: true };
    } catch (error) {
        console.error('Error en shell:openPath:', error);
        return { success: false, error: error.message };
    }
});
