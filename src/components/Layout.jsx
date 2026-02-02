import * as React from 'react';
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sidebar } from './Sidebar';
import logoImage from '../assets/inventario.png';

/**
 * Layout principal de la aplicación con sidebar
 */
export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  /**
   * Abre el modal de confirmación de cierre de sesión
   */
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  /**
   * Cierra el modal de logout sin hacer nada
   */
  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  /**
   * Confirma y ejecuta el cierre de sesión
   */
  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setIsSidebarOpen(false);
    logout();
    navigate('/');
  };

  /**
   * Toggle sidebar en móviles
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    //limpiamo el intervalo de cada tiempo 
    return () => clearInterval(interval);
  }, []);

  // Limpiar el estado del sidebar cuando se desmonte el componente
  useEffect(() => {
    return () => {
      setIsSidebarOpen(false);
    };
  }, []);

  // Cerrar modal de logout con Escape
  useEffect(() => {
    if (!showLogoutModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowLogoutModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showLogoutModal]);

  //funcion para la fecha y la hora
  const formaDateTime = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const date = currentDateTime.toLocaleDateString('es-Es', options);
    const time = currentDateTime.toLocaleTimeString('es-ES');
    return { date, time };
  };
  const { date, time } = formaDateTime();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Modal de confirmación de cierre de sesión */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
          onClick={handleLogoutCancel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div
            className="w-full max-w-sm p-6 bg-white shadow-xl rounded-xl dark:bg-gray-800 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="logout-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              ¿Estás seguro de que deseas cerrar sesión?
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Serás redirigido a la pantalla de inicio de sesión.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleLogoutCancel}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
          onMouseDown={(e) => e.preventDefault()}
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between flex-shrink-0 h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-white rounded-lg dark:bg-gray-700">
              <img
                src={logoImage}
                alt="Absolute Gestión de Bienes"
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Absolute Gestión de Bienes</h1>
            </div>
          </div>
        </div>

        {/* Navegación con scroll */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto">
          <Sidebar />
        </div>

        {/* Footer del sidebar */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogoutClick}
            className="flex items-center w-full gap-3 px-4 py-3 text-red-600 transition-colors rounded-lg dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 group"
          >
            <div className="p-2 text-red-600 rounded-lg bg-red-50 group-hover:bg-red-100">
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header superior */}
        <header className="z-10 flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            {/* Toggle de Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>

            {/* Fecha y Hora */}
            <div className="flex flex-col items-end text-right">
              <p className="text-xs font-medium text-gray-900 capitalize dark:text-gray-100">{date}</p>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{time}</p>
            </div>

            {/* Separador */}
            <div className="hidden w-px h-10 bg-gray-200 dark:bg-gray-700 lg:block"></div>

            {/* Usuario */}
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <button
                  onClick={() => navigate('/profile')}
                  className="text-sm font-medium text-gray-900 transition-colors dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {user?.name || 'Usuario'}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario Regular'}
                </p>
              </div>
              <button
                onClick={() => navigate('/change-password')}
                className="p-2 text-gray-600 transition-colors rounded-lg dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                title="Cambiar contraseña"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center justify-center w-10 h-10 font-semibold text-white transition-transform rounded-full bg-gradient-to-br from-blue-600 to-blue-700 hover:scale-105"
                title="Mi perfil"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

