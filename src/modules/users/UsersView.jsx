import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from './hooks/useUsers';
import { UsersTable } from './components/UsersTable';

/**
 * Vista principal de gestión de usuarios
 */
export default function UsersView() {
  const navigate = useNavigate();
  const {
    users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    deleteUser,
    refreshUsers,
  } = useUsers();

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg dark:border-red-800 bg-red-50 dark:bg-red-900/20 animate-fadeIn">
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

        {/* Barra de búsqueda */}
        <div className="p-4 mb-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
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
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuarios por nombre, username o rol..."
                className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => navigate('/users/register')}
              className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 whitespace-nowrap"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <UsersTable users={users} loading={loading} onDelete={deleteUser} />
      </div>
    </div>
  );
}



