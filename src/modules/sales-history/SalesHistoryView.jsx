import * as React from 'react';
import { useSalesHistory } from './hooks/useSalesHistory';
import { FilterBar } from './components/FilterBar';
import { StatisticsCards } from './components/StatisticsCards';
import { SalesTable } from './components/SalesTable';
import { SalesDetailModal } from './components/SalesDetailModal';

/**
 * Vista principal del historial de movimientos
 */
export default function SalesHistoryView() {
  const {
    sales,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    selectedSale,
    showDetailModal,
    setShowDetailModal,
    statistics,
    loadSales,
    loadSaleDetails,
    reprintTicket,
  } = useSalesHistory();

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historial de Movimientos</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Consulta y administra todos los movimientos de bienes registrados
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="p-4 mb-4 border-l-4 border-red-500 rounded-r-lg dark:border-red-800 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-red-500 dark:text-red-400"
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
              <p className="font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <StatisticsCards statistics={statistics} />

        {/* Filtros */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          onRefresh={loadSales}
        />

        {/* Tabla de ventas */}
        <SalesTable
          sales={sales}
          loading={loading}
          onViewDetails={loadSaleDetails}
          onReprint={reprintTicket}
        />

        {/* Modal de detalles */}
        <SalesDetailModal
          isOpen={showDetailModal}
          sale={selectedSale}
          onClose={() => setShowDetailModal(false)}
          onReprint={reprintTicket}
        />
      </div>
    </div>
  );
}

