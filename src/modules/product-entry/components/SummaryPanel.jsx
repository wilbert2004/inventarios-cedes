import * as React from 'react';

/**
 * Componente de panel de resumen de entrada
 */
export const SummaryPanel = ({ totals, onProcess, onCancel, processing, disabled }) => {
  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Resumen</h2>

        <div className="space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Total de productos:</span>
            <span className="font-semibold">{totals.totalProducts}</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Cantidad total:</span>
            <span className="font-semibold">{totals.totalQuantity}</span>
          </div>
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Valor estimado:</span>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                ${totals.estimatedValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="space-y-2">
        <button
          onClick={onProcess}
          disabled={disabled || processing}
          className="flex items-center justify-center w-full gap-2 py-4 text-lg font-semibold text-white transition-colors bg-green-600 rounded-lg dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
              Procesando...
            </>
          ) : (
            <>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Registrar Entrada
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={disabled || processing}
          className="w-full py-3 font-medium text-red-600 transition-colors bg-white border-2 border-red-600 rounded-lg dark:text-red-400 dark:bg-gray-700 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:border-gray-300 dark:disabled:border-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

