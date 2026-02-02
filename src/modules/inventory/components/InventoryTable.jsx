import * as React from 'react';

/**
 * Componente de tabla de inventario
 */
export function InventoryTable({ products, loading, onRefresh, sortBy, sortDir, onChangeSort }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando inventario...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-lg font-medium text-gray-900 dark:text-white">No hay bienes en el inventario</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Agrega bienes desde el módulo de Bienes en Custodia
        </p>
      </div>
    );
  }

  const getStockBadge = (stock, active) => {
    if (!active) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
          Inactivo
        </span>
      );
    }
    if (stock === 0) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
          Sin Stock
        </span>
      );
    }
    if (stock <= 10) {
      return (
        <span className="px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full">
          Stock Bajo
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
        En Stock
      </span>
    );
  };

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Inventario ({products.length} productos)
          </h2>
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {[
                { key: 'name', label: 'Producto', align: 'left' },
                { key: 'barcode', label: 'Código', align: 'left' },
                { key: 'stock', label: 'Stock', align: 'right' },
                { key: 'purchase_cost', label: 'Precio Compra', align: 'right' },
                { key: 'sale_price', label: 'Precio Venta', align: 'right' },
                { key: 'value', label: 'Valor Total', align: 'right', sortable: false },
              ].map((col) => (
                <th
                  key={col.key}
                  className={`px-6 py-3 text-xs font-medium tracking-wider uppercase text-gray-500 dark:text-gray-400 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  <button
                    type="button"
                    disabled={col.sortable === false}
                    onClick={() => onChangeSort && onChangeSort(col.key)}
                    className={`inline-flex items-center gap-1 ${col.sortable === false ? 'cursor-default' : 'hover:text-gray-700 dark:hover:text-gray-200'}`}
                  >
                    <span>{col.label}</span>
                    {col.sortable !== false && sortBy === col.key && (
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        {sortDir === 'asc' ? (
                          <path d="M5 12l5-5 5 5H5z" />
                        ) : (
                          <path d="M5 8l5 5 5-5H5z" />
                        )}
                      </svg>
                    )}
                  </button>
                </th>
              ))}
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase dark:text-gray-400">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {products.map((product) => {
              const totalValue = product.stock * (product.purchase_cost || 0);
              return (
                <tr
                  key={product.id}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {product.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {product.barcode || (
                        <span className="text-gray-400 dark:text-gray-500">Sin código</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      ${(product.purchase_cost || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      ${(product.sale_price || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      ${totalValue.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    {getStockBadge(product.stock, product.active)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
