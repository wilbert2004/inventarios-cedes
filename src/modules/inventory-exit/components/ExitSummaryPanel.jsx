import { useState } from 'react';

/**
 * Panel de resumen para procesar la salida
 * Muestra información de envío/recepción y botones de acción
 */
export function ExitSummaryPanel({
    totals,
    formData,
    onProcess,
    onCancel,
    isProcessing,
    cartItemsCount,
}) {
    const [deliveredBy, setDeliveredBy] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [deliveredError, setDeliveredError] = useState('');
    const [receivedError, setReceivedError] = useState('');

    /**
     * Validar y procesar salida
     */
    const handleProcess = () => {
        setDeliveredError('');
        setReceivedError('');

        let hasErrors = false;

        if (!deliveredBy.trim()) {
            setDeliveredError('Requerido');
            hasErrors = true;
        }

        if (!receivedBy.trim()) {
            setReceivedError('Requerido');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        onProcess({
            deliveredBy: deliveredBy.trim(),
            receivedBy: receivedBy.trim(),
        });
    };

    // Validar si se puede procesar
    const canProcess = cartItemsCount > 0 && formData.folio && formData.reason && !isProcessing;

    return (
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Encabezado */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Resumen de Salida
                </h3>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
                {/* Información de la salida */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Información</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Folio</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formData.folio || '—'}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Motivo</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formData.reason || '—'}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Fecha</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formData.exit_date
                                    ? new Date(formData.exit_date).toLocaleDateString('es-ES')
                                    : '—'}
                            </p>
                        </div>

                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Descripción</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formData.description || 'Sin descripción'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Totales */}
                <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-gray-900 dark:text-white">Totales</h4>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Productos</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totals.totalProducts}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Cantidad</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totals.totalQuantity}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Valor</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                ${totals.estimatedValue?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Datos de entrega/recepción */}
                <div className="space-y-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <h4 className="font-medium text-gray-900 dark:text-white">Entrega y Recepción</h4>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Entregado por <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={deliveredBy}
                            onChange={(e) => {
                                setDeliveredBy(e.target.value);
                                setDeliveredError('');
                            }}
                            placeholder="Nombre de quien entrega"
                            disabled={!canProcess}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${deliveredError
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50`}
                        />
                        {deliveredError && (
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{deliveredError}</p>
                        )}
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            Recibido por <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={receivedBy}
                            onChange={(e) => {
                                setReceivedBy(e.target.value);
                                setReceivedError('');
                            }}
                            placeholder="Nombre de quien recibe"
                            disabled={!canProcess}
                            className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${receivedError
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                    : 'border-gray-300 dark:border-gray-600'
                                } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50`}
                        />
                        {receivedError && (
                            <p className="mt-1 text-xs text-red-500 dark:text-red-400">{receivedError}</p>
                        )}
                    </div>
                </div>

                {/* Validaciones */}
                {!canProcess && (
                    <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            <strong>⚠ Completa todos los campos:</strong>
                            <ul className="mt-2 ml-4 text-xs list-disc space-y-1">
                                {cartItemsCount === 0 && <li>Debe haber al menos un producto</li>}
                                {!formData.folio && <li>Ingresa el folio</li>}
                                {!formData.reason && <li>Selecciona el motivo</li>}
                            </ul>
                        </p>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleProcess}
                        disabled={!canProcess || isProcessing}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${canProcess && !isProcessing
                                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                                : 'bg-gray-400 dark:bg-gray-600 text-white opacity-50 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Procesando...
                            </span>
                        ) : (
                            'Procesar Salida'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
