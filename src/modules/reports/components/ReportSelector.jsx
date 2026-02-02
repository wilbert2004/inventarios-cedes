import React from 'react';
import { REPORT_TYPES, REPORT_TYPE_LABELS } from '../types/reportTypes';

/**
 * Selector de tipo de reporte
 * Muestra 4 botones: Diario, Semanal, Mensual, Anual
 * Cuando el usuario hace clic, llama a la función `onSelect`
 */
export function ReportSelector({ currentType, onSelect }) {
    const reportTypes = [
        REPORT_TYPES.DAILY,
        REPORT_TYPES.WEEKLY,
        REPORT_TYPES.MONTHLY,
        REPORT_TYPES.YEARLY,
        REPORT_TYPES.CUSTOM,
    ];

    return (
        <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
                Tipo de Reporte
            </h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {reportTypes.map((type) => (
                    <button
                        key={type}
                        onClick={() => onSelect(type)}
                        className={`
              px-4 py-3 rounded-lg font-medium transition-all
              ${currentType === type
                                ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }
            `}
                    >
                        {REPORT_TYPE_LABELS[type]}
                    </button>
                ))}
            </div>
        </div>
    );
}