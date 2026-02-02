import React from 'react';

/**
 * Filtros de fecha para el reporte
 * Permite que el usuario seleccione un rango personalizado de fechas
 */
export function ReportFilters({ dateRange, onDateChange }) {
    const handleStartDateChange = (e) => {
        // Crear fecha a partir del string sin zona horaria
        const dateStr = e.target.value; // "2026-01-05"
        const [year, month, day] = dateStr.split('-');
        const startDate = new Date(year, month - 1, day); // Mes es 0-indexado

        onDateChange({
            start: startDate,
            end: dateRange.end,
        });
    };

    const handleEndDateChange = (e) => {
        // Crear fecha a partir del string sin zona horaria
        const dateStr = e.target.value; // "2026-01-05"
        const [year, month, day] = dateStr.split('-');
        const endDate = new Date(year, month - 1, day); // Mes es 0-indexado

        onDateChange({
            start: dateRange.start,
            end: endDate,
        });
    };

    // Convertir fecha a formato que acepte el input (YYYY-MM-DD)
    const formatDateForInput = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes es 0-indexado
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div className="p-4 mb-6 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Filtros de Fecha
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Fecha Inicio */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha Inicio
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(dateRange.start)}
                        onChange={handleStartDateChange}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Fecha Fin */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha Fin
                    </label>
                    <input
                        type="date"
                        value={formatDateForInput(dateRange.end)}
                        onChange={handleEndDateChange}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
}