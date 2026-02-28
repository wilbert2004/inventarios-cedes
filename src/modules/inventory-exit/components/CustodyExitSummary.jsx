import { useState } from 'react';

/**
 * Panel de resumen para procesar salida de bienes en resguardo
 * Incluye los 3 responsables: Entrega, Transporta, Recibe
 */
export function CustodyExitSummary({
    totals,
    formData,
    onProcess,
    onCancel,
    isProcessing,
    cartItemsCount,
}) {
    // Estados para los 3 responsables
    const [deliveredBy, setDeliveredBy] = useState('');
    const [deliveredByPosition, setDeliveredByPosition] = useState('');
    const [transportedBy, setTransportedBy] = useState('');
    const [transportedByLicense, setTransportedByLicense] = useState('');
    const [receivedBy, setReceivedBy] = useState('');
    const [receivedByPosition, setReceivedByPosition] = useState('');

    // Estados de error
    const [errors, setErrors] = useState({});

    /**
     * Validar y procesar salida
     */
    const handleProcess = () => {
        const newErrors = {};

        // Validar Quien Entrega
        if (!deliveredBy.trim()) newErrors.deliveredBy = 'Requerido';
        if (!deliveredByPosition.trim()) newErrors.deliveredByPosition = 'Requerido';

        // Validar Quien Transporta
        if (!transportedBy.trim()) newErrors.transportedBy = 'Requerido';
        if (!transportedByLicense.trim()) newErrors.transportedByLicense = 'Requerido';

        // Validar Quien Recibe
        if (!receivedBy.trim()) newErrors.receivedBy = 'Requerido';
        if (!receivedByPosition.trim()) newErrors.receivedByPosition = 'Requerido';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        onProcess({
            deliveredBy: deliveredBy.trim(),
            deliveredByPosition: deliveredByPosition.trim(),
            transportedBy: transportedBy.trim(),
            transportedByLicense: transportedByLicense.trim(),
            receivedBy: receivedBy.trim(),
            receivedByPosition: receivedByPosition.trim(),
        });
    };

    const canProcess = cartItemsCount > 0 && formData.folio && !isProcessing;

    return (
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Encabezado */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Resumen de Salida
                </h3>
            </div>

            <div className="p-6 space-y-6">
                {/* Información de la salida */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">📄 Información del Documento</h4>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Folio</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formData.folio || '—'}
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

                        <div className="col-span-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <p className="text-xs text-gray-600 dark:text-gray-400">Destino</p>
                            <p className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                                Zona Principal
                            </p>
                        </div>

                        {formData.description && (
                            <div className="col-span-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Descripción</p>
                                <p className="text-sm text-gray-900 dark:text-white">
                                    {formData.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Totales */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">📊 Totales</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total de Bienes</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totals.totalItems}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Cantidad Total</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {totals.totalQuantity}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cadena de Custodia - 3 Responsables */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">👥 Cadena de Custodia</h4>

                    {/* 1. Quien Entrega (CEDES - Almacén) */}
                    <div className="p-4 rounded-lg border-2 border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 dark:bg-green-700 text-white font-bold">
                                1
                            </div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                                Quien Entrega (CEDES - Almacén)
                            </h5>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={deliveredBy}
                                    onChange={(e) => {
                                        setDeliveredBy(e.target.value);
                                        setErrors(prev => ({ ...prev, deliveredBy: '' }));
                                    }}
                                    placeholder="Nombre de quien entrega"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.deliveredBy
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                        } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500`}
                                />
                                {errors.deliveredBy && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.deliveredBy}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Puesto/Cargo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={deliveredByPosition}
                                    onChange={(e) => {
                                        setDeliveredByPosition(e.target.value);
                                        setErrors(prev => ({ ...prev, deliveredByPosition: '' }));
                                    }}
                                    placeholder="Ej: Jefe de Almacén"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.deliveredByPosition
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                        } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500`}
                                />
                                {errors.deliveredByPosition && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.deliveredByPosition}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 2. Quien Transporta */}
                    <div className="p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-600 dark:bg-yellow-700 text-white font-bold">
                                2
                            </div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                                Quien Transporta
                            </h5>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transportedBy}
                                    onChange={(e) => {
                                        setTransportedBy(e.target.value);
                                        setErrors(prev => ({ ...prev, transportedBy: '' }));
                                    }}
                                    placeholder="Nombre del transportista"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.transportedBy
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                        } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500`}
                                />
                                {errors.transportedBy && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transportedBy}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    N° Licencia/Credencial <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={transportedByLicense}
                                    onChange={(e) => {
                                        setTransportedByLicense(e.target.value);
                                        setErrors(prev => ({ ...prev, transportedByLicense: '' }));
                                    }}
                                    placeholder="Número de licencia"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.transportedByLicense
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                        } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500`}
                                />
                                {errors.transportedByLicense && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.transportedByLicense}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 3. Quien Recibe (Zona Principal) */}
                    <div className="p-4 rounded-lg border-2 border-blue-200 dark:border-blue-900/30 bg-blue-50 dark:bg-blue-900/10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-700 text-white font-bold">
                                3
                            </div>
                            <h5 className="font-semibold text-gray-900 dark:text-white">
                                Quien Recibe (Zona Principal)
                            </h5>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre completo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={receivedBy}
                                    onChange={(e) => {
                                        setReceivedBy(e.target.value);
                                        setErrors(prev => ({ ...prev, receivedBy: '' }));
                                    }}
                                    placeholder="Nombre de quien recibe"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.receivedBy
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                        } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500`}
                                />
                                {errors.receivedBy && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.receivedBy}</p>
                                )}
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Puesto/Cargo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={receivedByPosition}
                                    onChange={(e) => {
                                        setReceivedByPosition(e.target.value);
                                        setErrors(prev => ({ ...prev, receivedByPosition: '' }));
                                    }}
                                    placeholder="Ej: Coordinador de Zona"
                                    className={`w-full px-3 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.receivedByPosition
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                            : 'border-gray-300 dark:border-gray-600'
                                        } text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-blue-500`}
                                />
                                {errors.receivedByPosition && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.receivedByPosition}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleProcess}
                        disabled={!canProcess}
                        className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                Procesando...
                            </>
                        ) : (
                            <>
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
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Procesar Salida
                            </>
                        )}
                    </button>

                    <button
                        onClick={onCancel}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
