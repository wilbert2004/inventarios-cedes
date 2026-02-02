import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { generateUniqueBarcode, renderBarcode, downloadBarcodeAsImage } from '../utils/barcodeGenerator';

/**
 * Componente de modal para crear/editar productos
 */
export const ProductModal = ({ isOpen, onClose, onSubmit, loading, product }) => {
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    description: '',
    sale_price: '',
    purchase_cost: '',
    stock: '0',
    tipo_venta: 'UNIDAD',
    active: true,
  });

  const [errors, setErrors] = useState({});
  const barcodeCanvasRef = useRef(null);

  // Determinar si viene de entrada de productos (tiene barcode pero no id)
  const isFromProductEntry = product?.barcode && !product?.id;

  React.useEffect(() => {
    if (product) {
      setFormData({
        barcode: product.barcode || '',
        name: product.name || '',
        description: product.description || '',
        sale_price: product.sale_price?.toString() || '',
        purchase_cost: product.purchase_cost?.toString() || '',
        stock: product.stock?.toString() || '0',
        tipo_venta: product.tipo_venta || 'UNIDAD',
        // Si viene de entrada de productos, siempre activo
        active: isFromProductEntry ? true : (product.active === 1 || product.active === true),
      });
    }
  }, [product, isFromProductEntry]);

  // Renderizar código de barras cuando cambia el barcode
  useEffect(() => {
    if (formData.barcode && barcodeCanvasRef.current) {
      renderBarcode(formData.barcode, barcodeCanvasRef.current, {
        format: formData.barcode.length === 13 ? 'EAN13' : 'CODE128',
        width: 2,
        height: 100,
        displayValue: true,
        fontSize: 16,
        textMargin: 8,
        margin: 10,
      });
    }
  }, [formData.barcode]);

  /**
   * Generar código de barras único
   */
  const handleGenerateBarcode = () => {
    const newBarcode = generateUniqueBarcode();
    setFormData((prev) => ({ ...prev, barcode: newBarcode }));
    // Limpiar error si existe
    if (errors.barcode) {
      setErrors((prev) => ({ ...prev, barcode: '' }));
    }
  };

  /**
   * Descargar código de barras como imagen
   */
  const handleDownloadBarcode = () => {
    if (!formData.barcode) {
      alert('Primero genera o ingresa un código de barras');
      return;
    }
    const filename = formData.name || 'producto';
    downloadBarcodeAsImage(formData.barcode, filename);
  };


  /**
   * Manejar cambios en los inputs
   */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Limpiar error del campo al editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Validar formulario
   */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    // Validar precios solo si NO es PRECIO_LIBRE
    if (formData.tipo_venta !== 'PRECIO_LIBRE') {
      if (!formData.sale_price || parseFloat(formData.sale_price) <= 0) {
        newErrors.sale_price = 'El precio de venta debe ser mayor a 0';
      }

      if (!formData.purchase_cost || parseFloat(formData.purchase_cost) <= 0) {
        newErrors.purchase_cost = 'El costo de compra debe ser mayor a 0';
      }

      if (formData.sale_price && formData.purchase_cost &&
        parseFloat(formData.sale_price) < parseFloat(formData.purchase_cost)) {
        newErrors.sale_price = 'El precio de venta no puede ser menor al costo de compra';
      }

      if (!formData.stock || parseFloat(formData.stock) < 0) {
        newErrors.stock = 'El stock debe ser mayor o igual a 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const productData = {
      ...formData,
      // Para PRECIO_LIBRE, usar 0 como valores por defecto para precios
      sale_price: formData.tipo_venta === 'PRECIO_LIBRE'
        ? 0
        : parseFloat(formData.sale_price),
      purchase_cost: formData.tipo_venta === 'PRECIO_LIBRE'
        ? 0
        : parseFloat(formData.purchase_cost),
      stock: formData.tipo_venta === 'PRECIO_LIBRE' ? 0 : parseFloat(formData.stock),
      tipo_venta: formData.tipo_venta,
      // Si viene de entrada de productos, siempre activo
      active: isFromProductEntry ? 1 : (formData.active ? 1 : 0),
    };

    const result = await onSubmit(productData);

    if (result.success) {
      handleClose();
    }
  };

  /**
   * Cerrar modal y resetear formulario
   */
  const handleClose = () => {
    setFormData({
      barcode: '',
      name: '',
      description: '',
      sale_price: '',
      purchase_cost: '',
      stock: '0',
      tipo_venta: 'UNIDAD',
      active: true,
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {product?.id ? 'Editar Bien' : 'Nuevo Bien'}
            </h2>
            {product?.barcode && !product?.id && (
              <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                ⚠️ Producto no encontrado. Completa los datos para crearlo.
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 transition-colors dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Código de barras */}
            <div>
              <label
                htmlFor="barcode"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Código de barras
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-32 py-3 text-gray-900 bg-white border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.barcode ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    placeholder="Ej: 7501234567890"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateBarcode}
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-blue-600 transition-colors dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Generar
                  </button>
                </div>
                {errors.barcode && (
                  <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Opcional. Puedes generarlo automáticamente o ingresarlo manualmente.
                </p>

                {/* Vista previa del código de barras */}
                {formData.barcode && (
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900/50 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Vista previa del código de barras
                      </span>
                      <button
                        type="button"
                        onClick={handleDownloadBarcode}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Descargar
                      </button>
                    </div>
                    <div className="flex items-center justify-center p-4 bg-white rounded dark:bg-gray-800">
                      <canvas
                        ref={barcodeCanvasRef}
                        className="max-w-full"
                        width={300}
                        height={120}
                      />
                    </div>
                    <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                      Código: {formData.barcode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Nombre */}
            <div>
              <label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nombre del producto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.name ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                placeholder="Ej: Coca Cola 600ml"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg outline-none resize-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del producto (opcional)"
              />
            </div>

            {/* Precios */}
            {formData.tipo_venta !== 'PRECIO_LIBRE' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Precio de venta */}
                <div>
                  <label
                    htmlFor="sale_price"
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Precio de venta <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      id="sale_price"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-4 py-3 text-gray-900 bg-white border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.sale_price ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.sale_price && (
                    <p className="mt-1 text-sm text-red-600">{errors.sale_price}</p>
                  )}
                </div>

                {/* Costo de compra */}
                <div>
                  <label
                    htmlFor="purchase_cost"
                    className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Costo de compra <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      id="purchase_cost"
                      name="purchase_cost"
                      value={formData.purchase_cost}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full pl-8 pr-4 py-3 text-gray-900 bg-white border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.purchase_cost ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.purchase_cost && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.purchase_cost}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tipo de venta */}
            <div>
              <label
                htmlFor="tipo_venta"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tipo de venta <span className="text-red-500">*</span>
              </label>
              <select
                id="tipo_venta"
                name="tipo_venta"
                value={formData.tipo_venta}
                onChange={handleChange}
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UNIDAD">Por Unidad (piezas)</option>
                <option value="PESO">Por Peso (kilogramos)</option>
                <option value="PRECIO_LIBRE">Precio Variable</option>
              </select>
              {formData.tipo_venta === 'PRECIO_LIBRE' && (
                <div className="p-3 mt-2 border border-yellow-200 rounded-lg dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    ⚠️ Este producto no maneja inventario ni precio fijo
                  </p>
                </div>
              )}
            </div>

            {/* Cálculo de margen de ganancia */}
            {formData.tipo_venta !== 'PRECIO_LIBRE' &&
              formData.sale_price &&
              formData.purchase_cost &&
              parseFloat(formData.sale_price) > 0 &&
              parseFloat(formData.purchase_cost) > 0 && (
                <div className="p-4 border border-blue-200 rounded-lg dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 dark:text-blue-300">Margen de ganancia:</span>
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      $
                      {(
                        parseFloat(formData.sale_price) -
                        parseFloat(formData.purchase_cost)
                      ).toFixed(2)}{' '}
                      (
                      {(
                        ((parseFloat(formData.sale_price) -
                          parseFloat(formData.purchase_cost)) /
                          parseFloat(formData.purchase_cost)) *
                        100
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                </div>
              )}

            {/* Stock inicial */}
            <div>
              <label
                htmlFor="stock"
                className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {formData.tipo_venta === 'PESO' ? 'Stock inicial (kg)' : formData.tipo_venta === 'UNIDAD' ? 'Stock inicial (piezas)' : 'Stock inicial'}
                {formData.tipo_venta !== 'PRECIO_LIBRE' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                disabled={!!product || formData.tipo_venta === 'PRECIO_LIBRE'}
                value={formData.stock}
                onChange={handleChange}
                step={formData.tipo_venta === 'PESO' ? '0.01' : '1'}
                min="0"
                className={`w-full px-4 py-3 text-gray-900 bg-white border rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${errors.stock ? 'border-red-500 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  } ${formData.tipo_venta === 'PRECIO_LIBRE' ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={formData.tipo_venta === 'PESO' ? '0.00' : '0'}
              />
              {formData.tipo_venta === 'PRECIO_LIBRE' && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Los productos de precio variable no manejan inventario
                </p>
              )}
              {errors.stock && (
                <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
              )}
            </div>

            {/* Estado activo */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                disabled={isFromProductEntry}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded dark:border-gray-600 focus:ring-blue-500 dark:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="active" className="block ml-2 text-sm text-gray-700 dark:text-gray-300">
                Producto activo
                {isFromProductEntry && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(siempre activo para nuevas entradas)</span>
                )}
              </label>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col-reverse gap-3 mt-8 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-6 py-3 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center flex-1 gap-2 px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                'Guardar Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

