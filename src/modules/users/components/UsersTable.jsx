import * as React from 'react';

/**
 * Componente de fila de usuario
 */
const UserRow = ({ user, onDelete }) => {
  const roleLabels = {
    admin: 'Administrador',
    cashier: 'Cajero',
  };

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    cashier: 'bg-blue-100 text-blue-800',
  };

  const statusColor = user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  const statusText = user.active ? 'Activo' : 'Inactivo';

  const handleDelete = () => {
    if (window.confirm(`¿Estás seguro de desactivar al usuario "${user.name}"?`)) {
      onDelete(user.id);
    }
  };

  return (
    <tr className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-blue-600 to-blue-700">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
            roleColors[user.role] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
          }`}
        >
          {roleLabels[user.role] || user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}
        >
          {statusText}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {new Date(user.created_at).toLocaleDateString('es-MX')}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
        {user.id !== 1 && ( // No permitir eliminar al admin principal
          <button
            onClick={handleDelete}
            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
            title="Desactivar usuario"
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
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
};

/**
 * Componente de tabla de usuarios
 */
export const UsersTable = ({ users, loading, onDelete }) => {
  if (loading) {
    return (
      <div className="p-12 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <div className="flex flex-col items-center justify-center">
          <div className="w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No hay usuarios
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comienza agregando tu primer usuario usando el botón "Nuevo Usuario"
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
                Usuario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Rol
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Fecha de Creación
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {users.map((user) => (
              <UserRow key={user.id} user={user} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer con estadísticas */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total de usuarios: </span>
            <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Activos: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {users.filter((u) => u.active).length}
            </span>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Administradores: </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {users.filter((u) => u.role === 'admin').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};



