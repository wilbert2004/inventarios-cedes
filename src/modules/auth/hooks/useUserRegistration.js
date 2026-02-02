import { useState } from 'react';

/**
 * Custom hook para manejar el registro de usuarios
 */
export const useUserRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  /**
   * Registrar un nuevo usuario
   */
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Validaciones en el frontend
      if (!userData.name || !userData.username || !userData.password) {
        throw new Error('Todos los campos son requeridos');
      }

      if (userData.username.length < 3) {
        throw new Error('El nombre de usuario debe tener al menos 3 caracteres');
      }

      if (userData.password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (userData.password !== userData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Crear usuario
      const result = await window.api.users.create({
        name: userData.name,
        username: userData.username,
        password: userData.password,
        role: userData.role || 'cashier',
        active: userData.active !== undefined ? userData.active : 1,
      });

      setSuccess(true);
      return { success: true, user: result };
    } catch (err) {
      const errorMessage = err.message || 'Error al registrar usuario';
      setError(errorMessage);
      console.error('Error registering user:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Limpiar mensajes
   */
  const clearMessages = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    registerUser,
    clearMessages,
  };
};



