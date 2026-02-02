import * as React from 'react';

/**
 * Componente de modal para ver detalles de una entrada
 */
export const EntryDetailModal = ({ isOpen, entry, onClose }) => {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalles de Entrada #{entry.id}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {new Date(entry.timestamp).toLocaleString('es-MX', {
                dateStyle: 'full',
                timeStyle: 'short',
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Información de la entrada */}
          <div className="p-4 mb-6 rounded-lg bg-gray-50 dark:bg-gray-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Registrado por:</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {entry.userName || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de productos:</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {entry.totalItems}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de productos */}
          <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Productos ingresados
            </h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg dark:border-gray-700">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                      Producto
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase dark:text-gray-300">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-300">
                      Código de Barras
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {entry.items && entry.items.length > 0 ? (
                    entry.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.productName || 'Producto sin nombre'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                          {item.quantity.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          {item.productBarcode ? (
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                              {item.productBarcode}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No hay bienes en esta entrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumen total */}
          <div className="p-4 border-2 border-green-200 rounded-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-900 dark:text-white">Cantidad Total:</span>
              <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                {entry.totalQuantity.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {entry.totalItems} {entry.totalItems === 1 ? 'producto' : 'productos'} ingresado{entry.totalItems === 1 ? '' : 's'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={onClose}
            className="flex-1 py-3 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

