import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordView() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setIsLoading(true);

        try {
            const result = await window.api.users.requestPasswordReset(username);

            if (result.success) {
                setSuccess(true);
                // En desarrollo muestra el código, en producción se envía por email
                setTimeout(() => {
                    navigate('/reset-password', { state: { username, code: result.code } });
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Error al solicitar recuperación');
            console.error('Reset request error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-blue-800">
            <div className="w-full max-w-md">
                <div className="p-8 bg-white shadow-2xl rounded-2xl">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-3xl font-bold text-gray-900">Recuperar Contraseña</h1>
                        <p className="text-gray-600">Ingresa tu nombre de usuario</p>
                    </div>

                    {/* Mensajes */}
                    {error && (
                        <div className="p-4 mb-4 border-l-4 border-red-500 rounded-r-lg bg-red-50">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="p-4 mb-4 border-l-4 border-green-500 rounded-r-lg bg-green-50">
                            <p className="text-sm font-medium text-green-700">Código enviado. Redirigiendo...</p>
                        </div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                className="w-full py-3 px-4 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Enviando...' : 'Enviar Código'}
                        </button>
                    </form>

                    {/* Link volver */}
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            Volver al login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}