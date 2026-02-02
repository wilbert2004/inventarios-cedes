import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/inventario.png';

export default function LoginView() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const usernameInputRef = React.useRef(null);

  // Si ya está autenticado, redirigir
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/inventory');
    }
  }, [isAuthenticated, navigate]);

  // Enfocar el input de username cuando se monta el componente
  useEffect(() => {
    const focusInput = () => {
      try {
        // Forzar el foco de la ventana de Electron
        if (window.api?.window?.focus) {
          window.api.window.focus().catch(() => { });
        }

        // Enfocar el input después de un pequeño delay
        if (usernameInputRef.current) {
          setTimeout(() => {
            if (usernameInputRef.current) {
              usernameInputRef.current.focus();
            }
          }, 200);
        }
      } catch (error) {
        console.error('Error al enfocar input:', error);
      }
    };

    // Ejecutar después de que el componente se monte
    const timer = setTimeout(focusInput, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login({ username, password });

      if (result.success) {
        navigate('/inventory');
      } else {
        setError(result.error || 'Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Intenta nuevamente.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800" style={{ position: 'relative', zIndex: 50 }}>
      <div className="w-full max-w-md">
        {/* Card de login */}
        <div className="p-8 bg-white shadow-2xl dark:bg-gray-800 rounded-2xl">
          {/* Logo y título */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center mb-6 p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full">
              <img
                src={logoImage}
                alt="Absolute POS Logo"
                className="object-contain w-32 h-32"
              />
            </div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Sistema de inventario</h1>
            <p className="text-gray-600 dark:text-gray-300">Inicia sesión para continuar</p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="p-4 mb-4 border-l-4 border-red-500 rounded-r-lg bg-red-50 dark:bg-red-900/20 animate-fadeIn">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usuario */}
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Usuario
              </label>
              <div className="relative">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <input
                  ref={usernameInputRef}
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="Ingresa tu usuario"
                  className="w-full py-3 pl-10 pr-4 text-gray-900 transition bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoComplete="username"
                  style={{ pointerEvents: 'auto' }}
                  tabIndex={0}
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contraseña
              </label>
              <div className="relative">
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
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full py-3 pl-10 pr-4 text-gray-900 transition bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{ pointerEvents: 'auto' }}
                  tabIndex={0}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {/* Recordar sesión */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm font-medium text-blue-600 border-none cursor-pointer dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-none"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de login */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full gap-2 px-4 py-3 font-semibold text-white transition-all duration-200 rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2026 Sistema de inventario. Todos los derechos reservados.
            </p>
          </div>
        </div>

        {/* Información adicional */}
        {/* <div className="mt-6 space-y-3 text-sm text-center text-white">
          <p className="opacity-90">
            Sistema de Punto de Venta - Versión 1.0.0
          </p>

          <div className="p-4 bg-white rounded-lg bg-opacity-10 backdrop-blur-sm">
            <p className="mb-2 text-xs font-semibold opacity-90">Credenciales por defecto:</p>
            <div className="space-y-1 text-xs opacity-80">
              <p>👤 Usuario: <strong>admin</strong></p>
              <p>🔑 Contraseña: <strong>admin123</strong></p>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}