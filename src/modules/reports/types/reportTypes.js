/**
 * TIPOS Y CONSTANTES PARA EL MÓDULO DE REPORTES
    * Este archivo centraliza todas las definiciones de reportes
*/

// Los 4 tipos principales de reportes
export const REPORT_TYPES = {
    DAILY: 'daily',      // Un solo día
    WEEKLY: 'weekly',    // 7 días
    MONTHLY: 'monthly',  // 30 días
    YEARLY: 'yearly',    // 365 días
    CUSTOM: 'custom',
};

// Nombre legible de cada tipo (para mostrar en UI)
export const REPORT_TYPE_LABELS = {
    [REPORT_TYPES.DAILY]: 'Reporte Diario',
    [REPORT_TYPES.WEEKLY]: 'Reporte Semanal',
    [REPORT_TYPES.MONTHLY]: 'Reporte Mensual',
    [REPORT_TYPES.YEARLY]: 'Reporte Anual',
    [REPORT_TYPES.CUSTOM]: 'Venta Específica',  

};

// Cuántos días atrás buscar para cada tipo
export const REPORT_DATE_RANGES = {
    [REPORT_TYPES.DAILY]: 1,      // 1 día
    [REPORT_TYPES.WEEKLY]: 7,     // 7 días
    [REPORT_TYPES.MONTHLY]: 30,   // 30 días
    [REPORT_TYPES.YEARLY]: 365,   // 365 días
    [REPORT_TYPES.CUSTOM]: 0,
};

// Estructura de datos que retorna cada reporte
export const REPORT_DATA_STRUCTURE = {
    type: String,           // daily, weekly, monthly, yearly
    dateRange: {
        start: Date,          // Fecha inicio
        end: Date,            // Fecha fin
    },
    summary: {
        totalSales: Number,   // Total dinero vendido
        transactionCount: Number, // Cuántas transacciones
    },
    sales: Array,           // Array de ventas en ese rango
    generatedAt: Date,      // Cuándo se generó el reporte
};