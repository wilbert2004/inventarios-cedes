import * as React from 'react';
import { useEntryHistory } from './hooks/useEntryHistory';
import { FilterBar } from './components/FilterBar';
import { StatisticsCards } from './components/StatisticsCards';
import { EntriesTable } from './components/EntriesTable';
import { EntryDetailModal } from './components/EntryDetailModal';

/**
 * Vista principal del historial de entradas de productos
 */
export default function EntryHistoryView() {
  const {
    entries,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    selectedEntry,
    showDetailModal,
    setShowDetailModal,
    statistics,
    loadMovements,
    loadEntryDetails,
  } = useEntryHistory();

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Historial de Entradas</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Consulta y administra todas las entradas de productos registradas
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
          onRefresh={loadMovements}
        />

        {/* Tabla de entradas */}
        <EntriesTable
          entries={entries}
          loading={loading}
          onViewDetails={loadEntryDetails}
        />

        {/* Modal de detalles */}
        <EntryDetailModal
          isOpen={showDetailModal}
          entry={selectedEntry}
          onClose={() => setShowDetailModal(false)}
        />
      </div>
    </div>
  );
}

