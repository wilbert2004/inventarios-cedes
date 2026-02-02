import * as React from 'react';

/**
 * Componente de fila de entrada
 */
const EntryRow = ({ entry, onViewDetails }) => {
  return (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">#{entry.id}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">
          {new Date(entry.timestamp).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(entry.timestamp).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{entry.userName || 'N/A'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-white">{entry.totalItems}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          {entry.totalQuantity.toLocaleString()}
        </div>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
        <button
          onClick={() => onViewDetails(entry.id)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
          title="Ver detalles"
        >
          <svg
            className="inline w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
};

/**
 * Componente de tabla de entradas
 */
export const EntriesTable = ({ entries, loading, onViewDetails }) => {
  if (loading) {
    return (
      <div className="p-12 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando entradas...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No hay entradas registradas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Las entradas de bienes aparecerán aquí una vez que se registren
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                # Entrada
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Fecha / Hora
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Usuario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Productos
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Cantidad Total
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {entries.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                onViewDetails={onViewDetails}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

