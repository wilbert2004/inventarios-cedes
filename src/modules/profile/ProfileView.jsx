import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Vista de perfil del usuario actual
 */
export default function ProfileView() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [originalData, setOriginalData] = useState(null);

  /**
   * Cargar datos del usuario
   */
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
      });
      setOriginalData({
        name: user.name || '',
        username: user.username || '',
      });
    }
  }, [user]);

  /**
   * Manejar cambios en los campos
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Verificar si hay cambios
   */
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.name !== originalData.name ||
      formData.username !== originalData.username
    );
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'El nombre de usuario solo puede contener letras, números y guiones bajos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasChanges()) {
      setErrors({ submit: 'No hay cambios para guardar' });
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      // Actualizar usuario
      const updatedUser = await window.api.users.update(user.id, {
        name: formData.name.trim(),
        username: formData.username.trim(),
        role: user.role, // Mantener el rol actual
        active: user.active !== undefined ? user.active : 1, // Mantener estado activo
      });

      // Actualizar contexto de autenticación
      if (updateUser) {
        updateUser(updatedUser);
      }

      // Actualizar datos originales
      setOriginalData({
        name: updatedUser.name,
        username: updatedUser.username,
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({
        submit: error.message || 'Error al actualizar perfil',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formatear fecha
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center w-full min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center mb-4 text-gray-600 transition-colors dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mi Perfil</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Actualiza tu información personal
          </p>
        </div>

        {/* Mensaje de éxito */}
        {success && (
          <div className="p-4 mb-6 border-l-4 border-green-500 rounded-r-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20 animate-fadeIn">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-green-500 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p className="font-medium text-green-700 dark:text-green-300">
                Perfil actualizado exitosamente
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Información del Perfil */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
              <div className="text-center">
                {/* Avatar */}
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 font-semibold text-white rounded-full bg-gradient-to-br from-blue-600 to-blue-700">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                
                {/* Nombre */}
                <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                
                {/* Rol */}
                <div className="inline-flex items-center px-3 py-1 mb-4 text-sm font-medium text-blue-800 bg-blue-100 rounded-full dark:text-blue-300 dark:bg-blue-900/30">
                  {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                </div>

                {/* Información adicional */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="mb-3 text-left">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Usuario</p>
                    <p className="text-sm text-gray-900 dark:text-white">{user.username}</p>
                  </div>
                  
                  {user.created_at && (
                    <div className="text-left">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Miembro desde</p>
                      <p className="text-sm text-gray-900 dark:text-white">{formatDate(user.created_at)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="p-6 mt-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">Acciones</h3>
              <button
                onClick={() => navigate('/change-password')}
                className="flex items-center w-full gap-3 px-4 py-3 mb-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
                Cambiar Contraseña
              </button>
            </div>
          </div>

          {/* Formulario de Edición */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Información Personal</h2>

              {/* Nombre */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Tu nombre completo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Username */}
              <div className="mb-6">
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nombre de Usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="nombre_usuario"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Solo letras, números y guiones bajos. Mínimo 3 caracteres.
                </p>
              </div>

              {/* Rol (solo lectura) */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Rol
                </label>
                <div className="flex items-center gap-3 px-4 py-2 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                  <span className="text-gray-700 dark:text-gray-300">
                    {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    (No se puede cambiar desde el perfil)
                  </span>
                </div>
              </div>

              {/* Error general */}
              {errors.submit && (
                <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                  <p className="text-sm font-medium text-red-700">{errors.submit}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      name: originalData?.name || '',
                      username: originalData?.username || '',
                    });
                    setErrors({});
                  }}
                  disabled={loading || !hasChanges()}
                  className="px-6 py-2 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !hasChanges()}
                  className="flex items-center gap-2 px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-b-2 border-white rounded-full animate-spin"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
