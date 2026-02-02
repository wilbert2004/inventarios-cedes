import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Modal que se muestra cuando la licencia ha expirado
 * No se puede cerrar excepto cuando se está en la vista de licencia
 */
export const LicenseExpiredModal = () => {
  const [licenseStatus, setLicenseStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClosedInLicensePage, setIsClosedInLicensePage] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  // En HashRouter, la ruta puede venir con o sin hash
  const currentPath = location.pathname || window.location.hash.replace('#', '') || '';
  const isLicensePage = currentPath === '/license' || currentPath.startsWith('/license');

  /**
   * Cargar estado de licencia
   */
  const loadLicenseStatus = async () => {
    try {
      setError(null);
      if (!window.api || !window.api.license) {
        console.warn('API de licencia no disponible');
        setLoading(false);
        return;
      }
      const status = await window.api.license.getStatus();
      setLicenseStatus(status);
    } catch (error) {
      console.error('Error al cargar estado de licencia:', error);
      setError(error.message);
      // En caso de error, no mostrar el modal
      setLicenseStatus({ isActivated: false, isDemoExpired: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenseStatus();
    
    // Verificar estado de licencia periódicamente
    const interval = setInterval(() => {
      loadLicenseStatus();
    }, 5000); // Verificar cada 5 segundos

    // Escuchar evento de activación de licencia
    const handleLicenseActivated = () => {
      loadLicenseStatus();
    };
    
    window.addEventListener('license:activated', handleLicenseActivated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('license:activated', handleLicenseActivated);
    };
  }, []);

  // Recargar estado cuando cambie la ruta
  useEffect(() => {
    loadLicenseStatus();
    // Resetear el estado de cierre cuando salimos de la página de licencia
    if (!isLicensePage) {
      setIsClosedInLicensePage(false);
    }
  }, [currentPath, isLicensePage]);

  // Determinar si el modal debe mostrarse
  const shouldShowModal = () => {
    // Si hay error, no mostrar
    if (error) return false;
    
    // Si está cargando o no hay estado, no mostrar
    if (loading || !licenseStatus) return false;
    
    // Si está activada, no mostrar
    if (licenseStatus.isActivated) return false;
    
    // Si el demo expiró, mostrar el modal
    if (licenseStatus.isDemoExpired) return true;
    
    return false;
  };

  /**
   * Navegar a la vista de licencia
   */
  const handleGoToLicense = () => {
    navigate('/license');
  };

  /**
   * Cerrar el modal (solo permitido en la página de licencia)
   */
  const handleClose = () => {
    if (isLicensePage) {
      setIsClosedInLicensePage(true);
    }
  };

  // Determinar si el modal debe mostrarse
  const shouldShow = () => {
    if (!shouldShowModal()) return false;
    
    // Si estamos en la página de licencia y el usuario cerró el modal, no mostrarlo
    if (isLicensePage && isClosedInLicensePage) return false;
    
    return true;
  };

  if (!shouldShow()) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="license-expired-title"
      aria-describedby="license-expired-description"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        className="w-full max-w-md p-6 bg-white shadow-2xl rounded-xl dark:bg-gray-800 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icono de advertencia */}
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/20">
          <svg
            className="w-8 h-8 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Título */}
        <h2
          id="license-expired-title"
          className="mb-2 text-2xl font-bold text-center text-gray-900 dark:text-white"
        >
          Licencia Expirada
        </h2>

        {/* Descripción */}
        <p
          id="license-expired-description"
          className="mb-6 text-center text-gray-600 dark:text-gray-400"
        >
          El período de demostración ha finalizado. Para continuar usando el sistema,
          debes activar una licencia válida.
        </p>

        {/* Información adicional */}
        <div className="p-4 mb-6 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Importante:</strong> No podrás acceder a otras funciones del sistema
            hasta que actives una licencia válida.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-3">
          {!isLicensePage && (
            <button
              onClick={handleGoToLicense}
              className="flex-1 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Ir a Activar Licencia
            </button>
          )}
          {isLicensePage && (
            <button
              onClick={handleClose}
              className="w-full px-6 py-3 font-medium text-white transition-colors bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
