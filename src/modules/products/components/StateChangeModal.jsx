import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Modal para cambiar el estado de un producto
 */
export const StateChangeModal = ({ product, onSubmit, onCancel, isSubmitting = false }) => {
    const { user } = useAuth();
    const [newStatus, setNewStatus] = useState('');
    const [reasonChange, setReasonChange] = useState('');
    const [error, setError] = useState('');

    // Campos de recepción (solo necesarios para cambiar a EN RESGUARDO)
    const [recibidoPorAlmacen, setRecibidoPorAlmacen] = useState(product.recibido_por_almacen || '');
    const [fechaRecepcionAlmacen, setFechaRecepcionAlmacen] = useState(product.fecha_recepcion_almacen || '');
    const [recibidoPorChofer, setRecibidoPorChofer] = useState(product.recibido_por_chofer || '');
    const [fechaRecepcionChofer, setFechaRecepcionChofer] = useState(product.fecha_recepcion_chofer || '');

    const statusLabels = {
        EN_TRANSITO: 'EN TRANSITO',
        EN_RESGUARDO: 'EN RESGUARDO',
        BAJA_DEFINITIVA: 'BAJA DEFINITIVA',
    };

    const validStatusTransitions = {
        EN_TRANSITO: ['EN_RESGUARDO', 'BAJA_DEFINITIVA'],
        EN_RESGUARDO: ['BAJA_DEFINITIVA'],
        BAJA_DEFINITIVA: [],
    };

    const getAvailableStatuses = () => {
        return validStatusTransitions[product.product_status] || [];
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!newStatus.trim()) {
            setError('Debe seleccionar un nuevo estado');
            return;
        }

        if (!reasonChange.trim()) {
            setError('Debe indicar el motivo del cambio');
            return;
        }

        // VALIDACIÓN ESPECIAL: Si se cambia a EN RESGUARDO, deben existir datos de recepción
        if (newStatus === 'EN_RESGUARDO') {
            if (!recibidoPorAlmacen.trim() || !fechaRecepcionAlmacen) {
                setError('Para cambiar a EN RESGUARDO debe proporcionar nombre y fecha de recepción en almacén');
                return;
            }
        }

        onSubmit({
            newStatus,
            reasonChange,
            changedBy: user?.id,
            receptionData: {
                recibido_por_almacen: recibidoPorAlmacen,
                fecha_recepcion_almacen: fechaRecepcionAlmacen,
                recibido_por_chofer: recibidoPorChofer,
                fecha_recepcion_chofer: fechaRecepcionChofer,
            }
        });
    };

    const getStatusInfo = (status) => {
        const info = {
            EN_TRANSITO: {
                description: 'El producto está en tránsito hacia el almacén CEDES',
                color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
            },
            EN_RESGUARDO: {
                description: 'El producto está bajo resguardo en el almacén',
                color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
            },
            BAJA_DEFINITIVA: {
                description: 'El producto ha sido dado de baja del sistema',
                color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
            },
        };
        return info[status] || {};
    };

    const availableStatuses = getAvailableStatuses();
    const currentStatusInfo = getStatusInfo(product.product_status);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información actual */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado Actual
                </h3>
                <div className={`p-3 border rounded-lg ${currentStatusInfo.color}`}>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {statusLabels[product.product_status] || product.product_status}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentStatusInfo.description}
                    </p>
                </div>
            </div>

            {/* Información del producto */}
            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3 space-y-2">
                <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">N° Inventario:</span>
                    <p className="font-mono font-semibold text-gray-900 dark:text-white">
                        {product.inventory_number}
                    </p>
                </div>
                <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Descripción:</span>
                    <p className="text-gray-900 dark:text-white">
                        {product.description}
                    </p>
                </div>
            </div>

            {/* Nuevo estado */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cambiar a Estado <span className="text-red-500">*</span>
                </label>

                {availableStatuses.length === 0 ? (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Este producto no puede cambiar de estado. Se encuentra en estado final.
                        </p>
                    </div>
                ) : (
                    <select
                        value={newStatus}
                        onChange={(e) => {
                            setNewStatus(e.target.value);
                            setError('');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="">-- Seleccionar nuevo estado --</option>
                        {availableStatuses.map(status => (
                            <option key={status} value={status}>
                                {statusLabels[status] || status}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Motivo del cambio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Motivo del Cambio <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={reasonChange}
                    onChange={(e) => {
                        setReasonChange(e.target.value);
                        setError('');
                    }}
                    placeholder="Explica por qué se realiza este cambio de estado..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            {/* Campos de recepción (solo si se cambia a EN RESGUARDO) */}
            {newStatus === 'EN_RESGUARDO' && (
                <div className="border-t pt-4 space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                            ⚠️ Para cambiar a EN RESGUARDO, debe registrar los datos de recepción en almacén
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Recibido por Almacén */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Recibido por (Almacén) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={recibidoPorAlmacen}
                                onChange={(e) => setRecibidoPorAlmacen(e.target.value)}
                                placeholder="Nombre de quien recibe"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Fecha Recepción Almacén */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha de Recepción <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={fechaRecepcionAlmacen}
                                onChange={(e) => setFechaRecepcionAlmacen(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Recibido por Chofer (En dado caso) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Recibido por (Chofer) <span className="text-gray-500 text-xs">(En dado caso)</span>
                            </label>
                            <input
                                type="text"
                                value={recibidoPorChofer}
                                onChange={(e) => setRecibidoPorChofer(e.target.value)}
                                placeholder="Nombre del chofer (en dado caso)"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Fecha Recepción Chofer (En dado caso) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fecha Recepción (Chofer) <span className="text-gray-500 text-xs">(En dado caso)</span>
                            </label>
                            <input
                                type="date"
                                value={fechaRecepcionChofer}
                                onChange={(e) => setFechaRecepcionChofer(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Mensaje de error */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            {/* Vista previa del nuevo estado */}
            {newStatus && (
                <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vista Previa
                    </h3>
                    <div className={`p-3 border rounded-lg ${getStatusInfo(newStatus).color}`}>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {statusLabels[newStatus] || newStatus}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getStatusInfo(newStatus).description}
                        </p>
                    </div>
                </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting || availableStatuses.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                    {isSubmitting ? 'Cambiando estado...' : 'Cambiar Estado'}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
};
