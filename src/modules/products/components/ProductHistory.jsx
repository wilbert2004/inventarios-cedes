import React, { useState, useEffect } from 'react';

/**
 * Componente para visualizar el historial de cambios de un producto
 */
export const ProductHistory = ({ product, onClose }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadHistory = async () => {
            if (!product) return;

            try {
                setLoading(true);
                setError(null);
                const historyData = await window.api.custodyLifecycle.getHistory(product.id);
                setHistory(historyData || []);
            } catch (err) {
                setError('Error al cargar el historial');
                console.error('Error loading history:', err);
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [product]);

    const getStatusColor = (status) => {
        const colors = {
            EN_TRANSITO: 'text-orange-600 dark:text-orange-400',
            EN_RESGUARDO: 'text-blue-600 dark:text-blue-400',
            BAJA_DEFINITIVA: 'text-red-600 dark:text-red-400',
        };
        return colors[status] || 'text-gray-600 dark:text-gray-400';
    };

    return (
        <div className="space-y-4">
            {/* Encabezado */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Historial del Producto
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        N° Inventario: <span className="font-mono">{product.inventory_number}</span>
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="py-8 text-center">
                    <div className="w-8 h-8 mx-auto mb-3 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando historial...</p>
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                </div>
            ) : history.length === 0 ? (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No hay cambios registrados
                </div>
            ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                    {history.map((entry, index) => (
                        <div
                            key={entry.id}
                            className="pb-4 border-l-2 border-gray-300 dark:border-gray-600 pl-4"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {entry.previous_status ? (
                                                <>
                                                    <span className={getStatusColor(entry.previous_status)}>
                                                        {entry.previous_status}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400"> → </span>
                                                    <span className={getStatusColor(entry.new_status)}>
                                                        {entry.new_status}
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    Registro inicial:
                                                    <span className={`ml-2 ${getStatusColor(entry.new_status)}`}>
                                                        {entry.new_status}
                                                    </span>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    {entry.reason_change && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {entry.reason_change}
                                        </p>
                                    )}

                                    <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        <span>
                                            {entry.changed_by_name && `Por: ${entry.changed_by_name}`}
                                        </span>
                                        <span>
                                            {new Date(entry.created_at).toLocaleString('es-ES', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Información del producto */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Información del Producto
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Serie:</span>
                        <p className="font-mono text-gray-900 dark:text-white">
                            {product.serial_number || '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Centro:</span>
                        <p className="text-gray-900 dark:text-white">
                            {product.center_origin || '-'}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Cantidad:</span>
                        <p className="text-gray-900 dark:text-white">
                            {product.quantity}
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-600 dark:text-gray-400">Registrado:</span>
                        <p className="text-gray-900 dark:text-white">
                            {new Date(product.created_at).toLocaleDateString('es-ES')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
