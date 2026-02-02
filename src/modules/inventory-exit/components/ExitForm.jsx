import * as React from 'react';
import { useState, useImperativeHandle, forwardRef } from 'react';

/**
 * Formulario para capturar datos de salida de inventario
 * Campos: Folio, Motivo, Fecha, Descripción
 */
export const ExitForm = forwardRef(({ onDataChange, initialData = {} }, ref) => {
    const [formData, setFormData] = useState({
        folio: initialData.folio || '',
        reason: initialData.reason || '',
        exit_date: initialData.exit_date || new Date().toISOString().split('T')[0],
        description: initialData.description || '',
    });

    const [errors, setErrors] = useState({});

    // Opciones de motivos de salida
    const reasonOptions = [
        'VENTA',
        'DEVOLUCIÓN',
        'ROTURA',
        'PÉRDIDA',
        'TRANSFERENCIA',
        'DONACIÓN',
        'BAJA',
        'OTRO',
    ];

    /**
     * Manejar cambios en los inputs
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Limpiar error del campo
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }

        // Notificar cambios al componente padre
        if (onDataChange) {
            onDataChange({
                ...formData,
                [name]: value,
            });
        }
    };

    /**
     * Validar formulario
     */
    const validate = () => {
        const newErrors = {};

        if (!formData.folio.trim()) {
            newErrors.folio = 'El folio es requerido';
        }

        if (!formData.reason) {
            newErrors.reason = 'El motivo es requerido';
        }

        if (!formData.exit_date) {
            newErrors.exit_date = 'La fecha es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Exponer métodos de validación al componente padre
     */
    useImperativeHandle(ref, () => ({
        validate,
        getData: () => formData,
    }));

    return (
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Datos de Salida
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Folio */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Folio <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="folio"
                        value={formData.folio}
                        onChange={handleChange}
                        placeholder="Ej: SAL-001, 2026-01-001"
                        className={`w-full px-4 py-2 rounded-lg border ${errors.folio
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700'
                            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    />
                    {errors.folio && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.folio}</p>
                    )}
                </div>

                {/* Motivo de Salida */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Motivo <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.reason
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700'
                            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    >
                        <option value="">-- Selecciona un motivo --</option>
                        {reasonOptions.map((reason) => (
                            <option key={reason} value={reason}>
                                {reason}
                            </option>
                        ))}
                    </select>
                    {errors.reason && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.reason}</p>
                    )}
                </div>

                {/* Fecha */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="exit_date"
                        value={formData.exit_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.exit_date
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700'
                            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    />
                    {errors.exit_date && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.exit_date}</p>
                    )}
                </div>

                {/* Descripción (opcional) */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción <span className="text-gray-500">(opcional)</span>
                    </label>
                    <input
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Notas sobre esta salida"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* Información de ayuda */}
            <div className="p-3 mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Nota:</strong> El folio debe ser único e identifica esta salida del inventario.
                </p>
            </div>
        </div>
    );
});

ExitForm.displayName = 'ExitForm';
