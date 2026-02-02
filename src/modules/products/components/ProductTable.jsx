import * as React from 'react';

/**
 * Componente de fila de producto
 */
const ProductRow = ({ product, onedit }) => {
  const statusColor = product.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const statusText = product.active ? 'Activo' : 'Inactivo';
  const stockColor = product.stock <= 5 ? 'text-red-600 font-semibold' : 'text-gray-900';

  return (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-mono text-sm text-gray-900 dark:text-white">{product.barcode}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
        {product.description && (
          <div className="max-w-xs text-sm text-gray-500 truncate dark:text-gray-400">
            {product.description}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          ${product.sale_price.toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          ${product.purchase_cost.toFixed(2)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className={`text-sm ${stockColor} dark:text-white`}>{product.stock}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
        >
          {statusText}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
        <button onClick={() => onedit(product)} className="mr-3 text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300" >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

/**
 * Componente de tabla de productos
 */
export const ProductTable = ({ products, loading, onedit }) => {
  if (loading) {
    return (
      <div className="p-12 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-12 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No hay bienes
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comienza agregando tu primer bien usando el botón "Nuevo Bien"
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Código de Barras
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Producto
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Precio Venta
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Costo Compra
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Stock
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400"
              >
                Estado
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {products.map((product) => (
              <ProductRow key={product.id} product={product} onedit={onedit} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total de productos: </span>
            <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Stock total: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {products.reduce((sum, p) => sum + p.stock, 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Valor inventario: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              ${products
                .reduce((sum, p) => sum + p.purchase_cost * p.stock, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

