import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';

/**
 * Formulario de datos para salida de bienes en resguardo
 * Solo captura: Folio, Fecha y Descripción (opcional)
 * Folio puede ser automático o manual
 */
export const CustodyExitForm = forwardRef(({ initialData, onDataChange }, ref) => {
    const [formData, setFormData] = useState({
        folio: initialData?.folio || '',
        exit_date: initialData?.exit_date || new Date().toISOString().split('T')[0],
        description: initialData?.description || '',
    });

    const [errors, setErrors] = useState({});
    const [folioChecking, setFolioChecking] = useState(false);
    const [isAutoFolio, setIsAutoFolio] = useState(true); // Por defecto automático
    const [generatingFolio, setGeneratingFolio] = useState(false);

    /**
     * Generar folio automático
     */
    const generateAutoFolio = async () => {
        try {
            setGeneratingFolio(true);
            setErrors(prev => ({ ...prev, folio: '' })); // Limpiar error anterior

            console.log('Solicitando generación de folio automático...');
            const newFolio = await window.api.custodyExit.generateFolio();
            console.log('Folio recibido:', newFolio);

            const newData = { ...formData, folio: newFolio };
            setFormData(newData);
            onDataChange?.(newData);
        } catch (error) {
            console.error('Error generating folio:', error);
            setErrors(prev => ({ ...prev, folio: `Error al generar folio: ${error.message || 'Verifica que la app esté iniciada correctamente'}` }));
        } finally {
            setGeneratingFolio(false);
        }
    };

    /**
     * Generar folio automático al montar componente si está en modo automático
     */
    useEffect(() => {
        if (isAutoFolio && !formData.folio) {
            generateAutoFolio();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Solo al montar

    /**
     * Sincronizar cambios en initialData (cuando se limpia después de procesar)
     */
    useEffect(() => {
        if (initialData) {
            setFormData({
                folio: initialData.folio || '',
                exit_date: initialData.exit_date || new Date().toISOString().split('T')[0],
                description: initialData.description || '',
            });
            
            // Si el folio está vacío, generar uno automático
            if (!initialData.folio && isAutoFolio) {
                generateAutoFolio();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData]); // Monitorear cambios en initialData

    /**
     * Cambiar modo de folio (automático/manual)
     */
    const handleToggleFolioMode = (auto) => {
        setIsAutoFolio(auto);
        setErrors(prev => ({ ...prev, folio: '' }));

        if (auto) {
            // Si cambia a automático, generar nuevo folio
            generateAutoFolio();
        } else {
            // Si cambia a manual, limpiar el folio para que escriba
            const newData = { ...formData, folio: '' };
            setFormData(newData);
            onDataChange?.(newData);
        }
    };

    /**
     * Validar unicidad de folio (solo en modo manual)
     */
    const validateFolio = async (folio) => {
        if (!folio.trim() || isAutoFolio) return true;

        try {
            setFolioChecking(true);
            const exists = await window.api.custodyExit.checkFolioExists(folio);
            if (exists) {
                setErrors(prev => ({ ...prev, folio: 'Este folio ya existe' }));
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error validating folio:', error);
            return false;
        } finally {
            setFolioChecking(false);
        }
    };

    /**
     * Manejar cambio en campos
     */
    const handleChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        setErrors((prev) => ({ ...prev, [field]: '' }));
        onDataChange?.(newData);

        // Validar folio en tiempo real
        if (field === 'folio') {
            validateFolio(value);
        }
    };

    /**
     * Validar formulario completo
     */
    const validate = () => {
        const newErrors = {};

        if (!formData.folio.trim()) {
            newErrors.folio = 'El folio es requerido';
        }

        if (!formData.exit_date) {
            newErrors.exit_date = 'La fecha es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Obtener datos del formulario
     */
    const getData = () => {
        return formData;
    };

    // Exponer métodos al componente padre
    useImperativeHandle(ref, () => ({
        validate,
        getData,
    }));

    return (
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
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
                    Datos del Documento de Salida
                </h3>
            </div>

            <div className="p-6 space-y-4">
                {/* Folio */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Folio <span className="text-red-500">*</span>
                        </label>

                        {/* Toggle Automático/Manual */}
                        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                                type="button"
                                onClick={() => handleToggleFolioMode(true)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${isAutoFolio
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                🤖 Automático
                            </button>
                            <button
                                type="button"
                                onClick={() => handleToggleFolioMode(false)}
                                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${!isAutoFolio
                                    ? 'bg-blue-500 text-white'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                ✍️ Manual
                            </button>
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={formData.folio}
                            onChange={(e) => handleChange('folio', e.target.value.toUpperCase())}
                            placeholder={isAutoFolio ? "Se generará automáticamente..." : "Ej: SAL-RSG-2026-001"}
                            disabled={isAutoFolio}
                            className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.folio
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500'
                                : isAutoFolio
                                    ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                                } text-gray-900 dark:text-white dark:bg-gray-700`}
                        />
                        {(folioChecking || generatingFolio) && (
                            <div className="absolute right-3 top-3">
                                <svg
                                    className="animate-spin h-5 w-5 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                            </div>
                        )}
                    </div>
                    {errors.folio && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.folio}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {isAutoFolio
                            ? '✨ Folio generado automáticamente: SAL-RSG-AÑO-### (consecutivo por año)'
                            : 'Formato sugerido: SAL-RSG-AÑO-### (debe ser único)'
                        }
                    </p>
                </div>

                {/* Fecha */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha de Salida <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        value={formData.exit_date}
                        onChange={(e) => handleChange('exit_date', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 ${errors.exit_date
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500'
                            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                            } text-gray-900 dark:text-white dark:bg-gray-700`}
                    />
                    {errors.exit_date && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.exit_date}</p>
                    )}
                </div>

                {/* Descripción/Observaciones */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Observaciones <span className="text-gray-400">(Opcional)</span>
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                        placeholder="Notas adicionales sobre la salida..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                    />
                </div>

                {/* Información sobre el destino */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="flex-1">
                            <p className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                                Destino Automático
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                Todos los bienes en salida serán trasladados a <strong>Zona Principal</strong>.
                                El traslado es definitivo y no regresa al área original.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

CustodyExitForm.displayName = 'CustodyExitForm';
