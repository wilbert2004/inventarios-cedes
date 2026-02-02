/**
 * Script para limpiar usuarios regulares de la base de datos
 * DESHABILITADO: Permitir crear usuarios regulares
 */

const db = require('./db/connection');

function cleanupRegularUsers() {
    // Función deshabilitada para permitir usuarios regulares
    // try {
    //     const result = db.prepare('DELETE FROM users WHERE role = ?').run('user');
    //     if (result.changes > 0) {
    //         console.log(`✓ ${result.changes} usuario(s) regular(es) eliminado(s)`);
    //     }
    // } catch (error) {
    //     console.error('Error cleaning up users:', error);
    // }
}

module.exports = { cleanupRegularUsers };
