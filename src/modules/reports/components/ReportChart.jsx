import React from 'react';

/**
 * Componente para mostrar gráficos
 * Por ahora muestra datos en tabla, después se puede integrar una librería de gráficos
 */
export function ReportChart({ data, reportType, loading }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[320px] p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">Cargando gráfico...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[320px] p-6 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">No hay datos para mostrar</p>
            </div>
        );
    }

    // Por ahora: mostrar tabla con datos
    // Más adelante: integrar Recharts o Chart.js para gráficos visuales
    return (
        <div className="flex flex-col min-h-[320px] p-4 md:p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                Datos del Reporte ({reportType})
            </h3>

            <div className="flex-1 min-h-0 overflow-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b dark:bg-gray-700 dark:border-gray-600">
                        <tr>
                            <th className="px-4 py-2 font-semibold text-left text-gray-700 dark:text-gray-300">
                                Fecha
                            </th>
                            <th className="px-4 py-2 font-semibold text-right text-gray-700 dark:text-gray-300">
                                Transacciones
                            </th>
                            <th className="px-4 py-2 font-semibold text-right text-gray-700 dark:text-gray-300">
                                Total Ventas
                            </th>
                            <th className="px-4 py-2 font-semibold text-right text-gray-700 dark:text-gray-300">
                                Promedio
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="px-4 py-2 dark:text-white">{row.date || 'N/A'}</td>
                                <td className="px-4 py-2 text-right dark:text-white">{row.transaction_count || 0}</td>
                                <td className="px-4 py-2 font-semibold text-right text-green-600 dark:text-green-400">
                                    ${parseFloat(row.total_sales || 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-2 text-right dark:text-white">
                                    ${parseFloat(row.average_transaction || 0).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}