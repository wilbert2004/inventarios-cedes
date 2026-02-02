import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica de usuarios
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Cargar todos los usuarios
   */
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.users.getAll();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar un usuario
   */
  const deleteUser = useCallback(async (id) => {
    try {
      setError(null);
      await window.api.users.delete(id);
      await loadUsers();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al eliminar usuario';
      setError(errorMessage);
      console.error('Error deleting user:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadUsers]);

  /**
   * Filtrar usuarios por término de búsqueda
   */
  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term)
    );
  });

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    deleteUser,
    refreshUsers: loadUsers,
  };
};



