import * as React from 'react';

/**
 * Componente de barra de búsqueda y filtros para inventario
 */
export function SearchBar({
  searchTerm,
  onSearchChange,
  lowStockFilter,
  onLowStockFilterChange,
  lowStockThreshold,
  onLowStockThresholdChange,
  statusFilter,
  onStatusFilterChange,
  activeFilter,
  onActiveFilterChange,
  tipoVentaFilter,
  onTipoVentaFilterChange,
}) {
  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Búsqueda */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o código de barras..."
              className="w-full py-2 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockFilter}
              onChange={(e) => onLowStockFilterChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Solo stock bajo (≤{lowStockThreshold})
            </span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Umbral</label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => onLowStockThresholdChange(parseInt(e.target.value || '10'))}
              className="w-20 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Estado</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos</option>
              <option value="IN_STOCK">En stock</option>
              <option value="LOW_STOCK">Stock bajo</option>
              <option value="OUT_OF_STOCK">Sin stock</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Activo</label>
            <select
              value={activeFilter}
              onChange={(e) => onActiveFilterChange(e.target.value)}
              className="px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 dark:text-gray-300">Tipo de venta</label>
            <select
              value={tipoVentaFilter}
              onChange={(e) => onTipoVentaFilterChange(e.target.value)}
              className="px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ALL">Todos</option>
              <option value="UNIDAD">Unidad</option>
              <option value="PESO">Peso</option>
              <option value="PRECIO_LIBRE">Precio libre</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
