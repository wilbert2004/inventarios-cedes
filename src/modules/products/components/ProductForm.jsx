import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Componente de formulario para bienes en custodia
 * Estructura en 3 secciones: Datos Generales, Bienes, Datos de Entrega
 */
export const ProductForm = ({ product = null, onSubmit, onCancel, isSubmitting = false }) => {
    const { user } = useAuth();

    // SECCIÓN 1: Datos Generales
    const [generalData, setGeneralData] = useState({
        center_origin: '',
        reference_folio: '',
        entregado_por_centro_trabajo: '',
        fecha_entrega: '',
    });

    // SECCIÓN 2: Productos (lista de productos a registrar)
    const [products, setProducts] = useState([{
        id: 1,
        inventory_number: '',
        serial_number: '',
        description: '',
        brand: '',
        model: '',
        quantity: 1,
        reason: 'RESGUARDO',
        notes: '',
    }]);
    const [nextProductId, setNextProductId] = useState(2);

    // SECCIÓN 3: Datos de Entrega (opcional - chofer y almacén)
    const [deliveryData, setDeliveryData] = useState({
        recibido_por_chofer: '',
        fecha_recepcion_chofer: '',
        recibido_por_almacen: '',
        fecha_recepcion_almacen: '',
    });

    const [errors, setErrors] = useState({});

    // Inicializar formulario con datos del producto si se está editando
    useEffect(() => {
        if (product) {
            setGeneralData({
                center_origin: product.center_origin || '',
                reference_folio: product.reference_folio || '',
                entregado_por_centro_trabajo: product.entregado_por_centro_trabajo || '',
                fecha_entrega: product.fecha_entrega || '',
            });
            setProducts([{
                id: 1,
                inventory_number: product.inventory_number || '',
                serial_number: product.serial_number || '',
                description: product.description || '',
                brand: product.brand || '',
                model: product.model || '',
                quantity: product.quantity || 1,
                reason: product.reason || 'RESGUARDO',
                notes: product.notes || '',
            }]);
            setDeliveryData({
                recibido_por_chofer: product.recibido_por_chofer || '',
                fecha_recepcion_chofer: product.fecha_recepcion_chofer || '',
                recibido_por_almacen: product.recibido_por_almacen || '',
                fecha_recepcion_almacen: product.fecha_recepcion_almacen || '',
            });
        }
    }, [product]);


    // Handlers para SECCIÓN 1: Datos Generales
    const handleGeneralChange = (e) => {
        const { name, value } = e.target;
        setGeneralData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[`general_${name}`]) {
            setErrors(prev => ({
                ...prev,
                [`general_${name}`]: ''
            }));
        }
    };

    // Handlers para SECCIÓN 2: Productos
    const handleProductChange = (productId, field, value) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, [field]: value } : p
        ));
        if (errors[`product_${productId}_${field}`]) {
            setErrors(prev => ({
                ...prev,
                [`product_${productId}_${field}`]: ''
            }));
        }
    };

    const addProduct = () => {
        setProducts(prev => [...prev, {
            id: nextProductId,
            inventory_number: '',
            serial_number: '',
            description: '',
            brand: '',
            model: '',
            quantity: 1,
            reason: 'RESGUARDO',
            notes: '',
        }]);
        setNextProductId(prev => prev + 1);
    };

    const removeProduct = (productId) => {
        if (products.length > 1) {
            setProducts(prev => prev.filter(p => p.id !== productId));
        }
    };

    // Handlers para SECCIÓN 3: Datos de Entrega
    const handleDeliveryChange = (e) => {
        const { name, value } = e.target;
        setDeliveryData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[`delivery_${name}`]) {
            setErrors(prev => ({
                ...prev,
                [`delivery_${name}`]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validar Datos Generales
        // Si estamos editando (product existe), los datos generales ya deben estar cargados
        // Si no están cargados, es error
        if (!generalData.center_origin.trim()) {
            newErrors.general_center_origin = 'El centro de origen es requerido';
        }
        if (!generalData.entregado_por_centro_trabajo.trim()) {
            newErrors.general_entregado_por_centro_trabajo = 'Quien entrega es requerido';
        }
        if (!generalData.fecha_entrega.trim()) {
            newErrors.general_fecha_entrega = 'La fecha de entrega es requerida';
        }

        // Validar Productos
        products.forEach(prod => {
            if (!prod.inventory_number.trim()) {
                newErrors[`product_${prod.id}_inventory_number`] = 'N° Inventario requerido';
            }
            if (!prod.description.trim()) {
                newErrors[`product_${prod.id}_description`] = 'Descripción requerida';
            }
            if (prod.quantity < 1) {
                newErrors[`product_${prod.id}_quantity`] = 'Cantidad debe ser > 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Si es edición de un único producto, usar el formato antiguo
        if (product && products.length === 1) {
            onSubmit({
                ...generalData,
                ...products[0],
                ...deliveryData,
                registered_by: user?.id || null,
            });
        } else {
            // Si es creación de múltiples productos, enviar como array
            onSubmit({
                general: generalData,
                products: products.map(p => ({
                    ...p,
                    ...deliveryData,
                    registered_by: user?.id || null,
                })),
            });
        }
    };



    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* =================== SECCIÓN 1: DATOS GENERALES =================== */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</span>
                    <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        Datos Generales de la Empresa
                    </h2>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4 ml-10">
                    Información de la empresa/centro que realiza la entrega
                </p>

                {product && (
                    <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                📌 Datos Generales Cargados
                            </p>
                            <p className="text-xs text-blue-800 dark:text-blue-400 mt-1">
                                Los datos generales se han cargado automáticamente desde el registro existente. Modifica si es necesario.
                            </p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {/* Fila 1: Centro de Origen (ancho completo) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Centro de Origen <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="center_origin"
                            value={generalData.center_origin}
                            onChange={handleGeneralChange}
                            placeholder="Ej: Dirección de Administración y Finanzas"
                            disabled={!!product}
                            className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${product
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                } ${errors.general_center_origin ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                            required
                        />
                        {errors.general_center_origin && (
                            <p className="text-red-500 text-sm mt-1">{errors.general_center_origin}</p>
                        )}
                    </div>

                    {/* Fila 2: Folio y Entregado Por */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Folio de Referencia
                            </label>
                            <input
                                type="text"
                                name="reference_folio"
                                value={generalData.reference_folio}
                                onChange={handleGeneralChange}
                                placeholder="Ej: DOC-2026-001"
                                disabled={!!product}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${product
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 cursor-not-allowed'
                                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                                    } focus:ring-blue-500`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Entregado por <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="entregado_por_centro_trabajo"
                                value={generalData.entregado_por_centro_trabajo}
                                onChange={handleGeneralChange}
                                placeholder="Nombre de quien entrega"
                                disabled={!!product}
                                className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${product
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 cursor-not-allowed'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                    } ${errors.general_entregado_por_centro_trabajo ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                                required
                            />
                            {errors.general_entregado_por_centro_trabajo && (
                                <p className="text-red-500 text-sm mt-1">{errors.general_entregado_por_centro_trabajo}</p>
                            )}
                        </div>
                    </div>

                    {/* Fila 3: Fecha de Entrega (ancho completo) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Fecha de Entrega <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            name="fecha_entrega"
                            value={generalData.fecha_entrega}
                            onChange={handleGeneralChange}
                            disabled={!!product}
                            className={`w-full px-4 py-2 border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${product
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                                } ${errors.general_fecha_entrega ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                            required
                        />
                        {errors.general_fecha_entrega && (
                            <p className="text-red-500 text-sm mt-1">{errors.general_fecha_entrega}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* =================== SECCIÓN 2: PRODUCTOS =================== */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 flex items-center gap-2">
                        <span className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</span>
                        Productos a Registrar
                    </h2>
                    <button
                        type="button"
                        onClick={addProduct}
                        className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar Producto
                    </button>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                    <strong>Nota:</strong> Una hoja de recolección puede contener 3-5 productos. Agregue uno por uno.
                </p>

                {/* Tabla de productos */}
                <div className="space-y-4">
                    {products.map((product, index) => (
                        <div key={product.id} className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    Producto #{index + 1}
                                </h3>
                                {products.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeProduct(product.id)}
                                        className="text-red-600 hover:text-red-700 dark:hover:text-red-400 transition"
                                        title="Eliminar producto"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Número de Inventario */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        N° Inventario <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={product.inventory_number}
                                        onChange={(e) => handleProductChange(product.id, 'inventory_number', e.target.value)}
                                        placeholder="Ej: FIZ5018U01D-B5"
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors[`product_${product.id}_inventory_number`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors[`product_${product.id}_inventory_number`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`product_${product.id}_inventory_number`]}</p>
                                    )}
                                </div>

                                {/* Número de Serie */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        N° Serie
                                    </label>
                                    <input
                                        type="text"
                                        value={product.serial_number}
                                        onChange={(e) => handleProductChange(product.id, 'serial_number', e.target.value)}
                                        placeholder="Ej: SN123456789"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Descripción */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Descripción del Producto <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={product.description}
                                        onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                                        placeholder="Ej: Computadora de escritorio, Impresora láser"
                                        rows="2"
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors[`product_${product.id}_description`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors[`product_${product.id}_description`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`product_${product.id}_description`]}</p>
                                    )}
                                </div>

                                {/* Marca y Modelo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Marca
                                    </label>
                                    <input
                                        type="text"
                                        value={product.brand}
                                        onChange={(e) => handleProductChange(product.id, 'brand', e.target.value)}
                                        placeholder="Ej: Dell, HP, Samsung"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Modelo
                                    </label>
                                    <input
                                        type="text"
                                        value={product.model}
                                        onChange={(e) => handleProductChange(product.id, 'model', e.target.value)}
                                        placeholder="Ej: XPS-15, LaserJet Pro"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Cantidad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Cantidad <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={product.quantity}
                                        onChange={(e) => handleProductChange(product.id, 'quantity', parseInt(e.target.value) || 1)}
                                        min="1"
                                        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${errors[`product_${product.id}_quantity`] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}`}
                                        required
                                    />
                                    {errors[`product_${product.id}_quantity`] && (
                                        <p className="text-red-500 text-sm mt-1">{errors[`product_${product.id}_quantity`]}</p>
                                    )}
                                </div>

                                {/* Motivo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Motivo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value="Resguardo"
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                    />
                                </div>

                                {/* Notas */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Notas/Observaciones
                                    </label>
                                    <textarea
                                        value={product.notes}
                                        onChange={(e) => handleProductChange(product.id, 'notes', e.target.value)}
                                        placeholder="Anotaciones adicionales..."
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Total de productos:</strong> {products.length}
                    </p>
                </div>
            </div>

            {/* =================== SECCIÓN 3: DATOS DE ENTREGA =================== */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                    <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</span>
                    Datos de Recepción (Chofer y Almacén)
                </h2>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                    Información de recepción por chofer y almacén (En dado caso)
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recibido por Chofer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Recibido por (Chofer)
                        </label>
                        <input
                            type="text"
                            name="recibido_por_chofer"
                            value={deliveryData.recibido_por_chofer}
                            onChange={handleDeliveryChange}
                            placeholder="Nombre del chofer (En dado caso)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    {/* Fecha Recepción Chofer */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Fecha Recepción (Chofer)
                        </label>
                        <input
                            type="date"
                            name="fecha_recepcion_chofer"
                            value={deliveryData.fecha_recepcion_chofer}
                            onChange={handleDeliveryChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-gray-900 z-10 py-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                    {isSubmitting ? 'Guardando...' : product ? 'Actualizar' : 'Registrar Productos'}
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


