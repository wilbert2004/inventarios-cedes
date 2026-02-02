import * as React from 'react';
import { useState, useImperativeHandle, forwardRef } from 'react';

/**
 * Formulario para capturar datos de entrada de inventario
 * Campos: Folio, Proveedor, Fecha, Descripción
 */
export const EntryForm = forwardRef(({ onDataChange, initialData = {} }, ref) => {
    const [formData, setFormData] = useState({
        folio: initialData.folio || '',
        provider: initialData.provider || '',
        entry_date: initialData.entry_date || new Date().toISOString().split('T')[0],
        description: initialData.description || '',
    });

    const [errors, setErrors] = useState({});

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

        if (!formData.provider.trim()) {
            newErrors.provider = 'El proveedor es requerido';
        }

        if (!formData.entry_date) {
            newErrors.entry_date = 'La fecha es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Exponer métodos de validación al componente padre
     */
    useImperativeHandle(ref, () => ({
        getData: () => formData,
    }));

    return (
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
                Datos de Entrada
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
                        placeholder="Ej: ENT-001, 2026-01-001"
                        className={`w-full px-4 py-2 rounded-lg border ${errors.folio
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700'
                            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    />
                    {errors.folio && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.folio}</p>
                    )}
                </div>

                {/* Proveedor */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Proveedor <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="provider"
                        value={formData.provider}
                        onChange={handleChange}
                        placeholder="Nombre del proveedor"
                        className={`w-full px-4 py-2 rounded-lg border ${errors.provider
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700'
                            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    />
                    {errors.provider && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.provider}</p>
                    )}
                </div>

                {/* Fecha */}
                <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="entry_date"
                        value={formData.entry_date}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg border ${errors.entry_date
                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700'
                            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400`}
                    />
                    {errors.entry_date && (
                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{errors.entry_date}</p>
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
                        placeholder="Notas sobre esta entrada"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* Información de ayuda */}
            <div className="p-3 mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                    <strong>Nota:</strong> El folio debe ser único y se utilizará para identificar esta entrada de inventario.
                </p>
            </div>
        </div>
    );
});

EntryForm.displayName = 'EntryForm';
