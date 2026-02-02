import React from 'react';
import { REPORT_TYPE_LABELS } from '../types/reportTypes';

/**
 * Resumen/Vista previa del reporte
 * Muestra estadísticas principales y opciones de descarga
 */
export function ReportPreview({ report, loading, onDownloadPDF }) {
    if (!report) {
        return (
            <div className="flex items-center justify-center min-h-[280px] p-6 text-center text-gray-500 bg-white rounded-lg shadow-md dark:bg-gray-800 dark:text-gray-400">
                Selecciona un reporte para ver el resumen
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[280px] p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">Generando resumen...</p>
            </div>
        );
    }

    const { type, dateRange, summary } = report;

    return (
        <div className="flex flex-col min-h-[320px] p-4 md:p-6 border border-blue-200 rounded-lg shadow-md bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800">
            {/* Encabezado del Reporte */}
            <div className="mb-4 md:mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {REPORT_TYPE_LABELS[type]}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {dateRange.start?.toLocaleDateString('es-ES')} al{' '}
                    {dateRange.end?.toLocaleDateString('es-ES')}
                </p>
            </div>

            {/* Estadísticas en Tarjetas (apiladas para mejor lectura en el panel derecho) */}
            <div className="grid grid-cols-1 gap-4 mb-6">
                {/* Tarjeta: Total Vendido */}
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Vendido</p>
                    <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
                        ${summary.totalSales?.toFixed(2) || '0.00'}
                    </p>
                </div>

                {/* Tarjeta: Transacciones */}
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transacciones</p>
                    <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {summary.transactionCount || 0}
                    </p>
                </div>

                {/* Tarjeta: Promedio */}
                <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ticket Promedio</p>
                    <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">
                        ${summary.averageTransaction?.toFixed(2) || '0.00'}
                    </p>
                </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-4 mt-auto">
                <button
                    onClick={() => onDownloadPDF(report)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    Descargar PDF
                </button>
                {/* Botones de Acción 
                <button
                    className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors bg-gray-300 rounded-lg hover:bg-gray-400"
                >
                     Imprimir
                </button>
                */}
            </div>
        </div>
    );
}