import * as React from 'react';
import { useState, useEffect } from 'react';

/**
 * Vista de CONTROL GENERAL
 * Relación histórica de todos los productos registrados
 * 
 * Similar a un libro físico de control usado para auditoría.
 * SOLO CONSULTA - No permite edición, creación ni eliminación.
 */
export default function ControlGeneralView() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);
    const [lastPdfPath, setLastPdfPath] = useState(null);

    // Cargar TODOS los productos (incluidos dados de baja)
    const loadAllProducts = async () => {
        try {
            setLoading(true);
            // Obtener todos sin filtros
            const data = await window.api.custodyLifecycle.getAll({});
            setProducts(data);
            setFilteredProducts(data);
            setError('');
        } catch (err) {
            setError(err.message || 'Error al cargar relación de control');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllProducts();
    }, []);

    // Filtrar productos por búsqueda
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredProducts(products);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = products.filter(p =>
            p.inventory_number?.toLowerCase().includes(term) ||
            p.serial_number?.toLowerCase().includes(term) ||
            p.description?.toLowerCase().includes(term) ||
            p.center_origin?.toLowerCase().includes(term) ||
            p.reference_folio?.toLowerCase().includes(term) ||
            p.brand?.toLowerCase().includes(term) ||
            p.model?.toLowerCase().includes(term)
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const getStatusBadge = (status) => {
        const badges = {
            'EN_TRANSITO': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            'EN_RESGUARDO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'BAJA_DEFINITIVA': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
        };
        return badges[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const showNotification = (message, type = 'success') => {
        if (type === 'success') {
            setSuccessMessage(message);
            setTimeout(() => {
                setSuccessMessage('');
                setLastPdfPath(null);
            }, 6000);
        } else {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 4000);
        }
    };

    const handleOpenPDF = async () => {
        if (!lastPdfPath) return;

        try {
            await window.api.shell.openPath(lastPdfPath);
        } catch (error) {
            console.error('Error abriendo PDF:', error);
        }
    };

    const handleDownloadPDF = async () => {
        if (!selectedProduct) {
            console.log('No hay producto seleccionado');
            return;
        }

        console.log('Iniciando descarga de PDF para:', selectedProduct.inventory_number);
        setIsDownloading(true);

        try {
            // Preparar los datos del producto para el PDF
            const productData = {
                inventory_number: selectedProduct.inventory_number,
                serial_number: selectedProduct.serial_number || 'N/A',
                description: selectedProduct.description,
                brand: selectedProduct.brand || 'N/A',
                model: selectedProduct.model || 'N/A',
                quantity: selectedProduct.quantity,
                reason: selectedProduct.reason,
                product_status: selectedProduct.product_status,
                product_condition: selectedProduct.product_condition || 'BUENO',
                product_image: selectedProduct.product_image || null,
                center_origin: selectedProduct.center_origin,
                reference_folio: selectedProduct.reference_folio || 'N/A',
                entregado_por_centro_trabajo: selectedProduct.entregado_por_centro_trabajo || 'N/A',
                fecha_entrega: selectedProduct.fecha_entrega,
                recibido_por_chofer: selectedProduct.recibido_por_chofer || 'N/A',
                fecha_recepcion_chofer: selectedProduct.fecha_recepcion_chofer,
                recibido_por_almacen: selectedProduct.recibido_por_almacen || 'N/A',
                fecha_recepcion_almacen: selectedProduct.fecha_recepcion_almacen,
                notes: selectedProduct.notes || 'Sin notas',
                created_at: selectedProduct.created_at,
                fecha_baja: selectedProduct.fecha_baja
            };

            console.log('Llamando a window.api.reports.generatePDF...');

            // Verificar que la API existe
            if (!window.api || !window.api.reports || !window.api.reports.generatePDF) {
                throw new Error('La API de generación de PDF no está disponible');
            }

            const result = await window.api.reports.generatePDF(
                { product: productData },
                'custody-detail'
            );

            console.log('Resultado de generatePDF:', result);

            // Si el usuario canceló el diálogo
            if (!result) {
                console.log('Usuario canceló la descarga');
                showNotification('Descarga cancelada', 'error');
                return;
            }

            if (result.success) {
                setLastPdfPath(result.filePath);
                showNotification('PDF generado con éxito');
            } else {
                showNotification(result.error || 'Error al generar el PDF', 'error');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            showNotification(`Error al descargar el PDF: ${error.message}`, 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                � Control General - Trazabilidad de Bienes
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Registro completo de todos los bienes • Solo consulta • Sin edición
                            </p>
                        </div>
                        <button
                            onClick={loadAllProducts}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar
                        </button>
                    </div>
                </div>

                {/* Alerta informativa */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                                Vista de Solo Consulta
                            </h3>
                            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                                Esta vista replica un libro físico de control usado para auditoría.
                                Los registros no pueden ser editados ni eliminados desde aquí.
                                Para modificar bienes, use el módulo de Bienes en Custodia.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Notificaciones */}
                {successMessage && (
                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-500 dark:border-green-700 rounded-lg animate-fadeIn">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <p className="font-medium text-green-700 dark:text-green-300">{successMessage}</p>
                            </div>
                            {lastPdfPath && (
                                <button
                                    onClick={handleOpenPDF}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    Ver detalles
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-500 dark:border-red-700 rounded-lg flex items-center gap-3 animate-fadeIn">
                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Estadísticas rápidas */}
                <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Registros</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">En Tránsito</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {products.filter(p => p.product_status === 'EN_TRANSITO').length}
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">En Resguardo</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {products.filter(p => p.product_status === 'EN_RESGUARDO').length}
                        </p>
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Baja Definitiva</p>
                        <p className="text-2xl font-bold text-gray-600">
                            {products.filter(p => p.product_status === 'BAJA_DEFINITIVA').length}
                        </p>
                    </div>
                </div>

                {/* Búsqueda */}
                <div className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Buscar en relación de control
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar por inventario, serie, descripción, centro, folio, marca, modelo..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    {searchTerm && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Mostrando {filteredProducts.length} de {products.length} registros
                        </p>
                    )}
                </div>

                {/* Tabla de Control General */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando relación de control...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {searchTerm ? 'No se encontraron registros' : 'No hay registros en el control'}
                            </h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                {searchTerm ? 'Intente con otros términos de búsqueda' : 'Los productos aparecerán aquí cuando sean registrados'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700 border-b-2 border-gray-200 dark:border-gray-600">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Folio
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Centro de Trabajo
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Descripción del Equipo
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Marca
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Modelo
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            N° Inventario
                                        </th>
                                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            N° Serie
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Motivo
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Estado Actual
                                        </th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                                            Ver
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                                    {filteredProducts.map((product, index) => (
                                        <tr
                                            key={product.id}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${product.product_status === 'BAJA_DEFINITIVA' ? 'opacity-60' : ''
                                                }`}
                                        >
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                                                {formatDate(product.created_at)}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white font-mono text-xs">
                                                {product.reference_folio || '-'}
                                            </td>
                                            <td className="px-3 py-3 text-gray-900 dark:text-white">
                                                {product.center_origin || '-'}
                                            </td>
                                            <td className="px-3 py-3 text-gray-900 dark:text-white">
                                                <div className="max-w-xs">
                                                    {product.description}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 text-center text-gray-900 dark:text-white font-semibold">
                                                {product.quantity}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                                                {product.brand || '-'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white">
                                                {product.model || '-'}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white font-mono font-semibold">
                                                {product.inventory_number}
                                            </td>
                                            <td className="px-3 py-3 whitespace-nowrap text-gray-900 dark:text-white font-mono text-xs">
                                                {product.serial_number || '-'}
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${product.reason === 'BAJA' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                    product.reason === 'RESGUARDO' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    }`}>
                                                    {product.reason}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.product_status)}`}>
                                                    {product.product_status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-center whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProduct(product);
                                                        setShowDetail(true);
                                                    }}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                                                    title="Ver detalles"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer con totales */}
                {filteredProducts.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                                Total de registros en esta vista: <strong>{filteredProducts.length}</strong>
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                                Cantidad total de equipos: <strong>{filteredProducts.reduce((sum, p) => sum + p.quantity, 0)}</strong>
                            </span>
                        </div>
                    </div>
                )}

                {/* Info adicional */}
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                        📋 Acerca del Control General
                    </h3>
                    <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-400">
                        <li>• Esta vista replica un libro físico de control usado para auditorías</li>
                        <li>• Incluye TODOS los productos: activos y dados de baja</li>
                        <li>• No permite edición, creación ni eliminación de registros</li>
                        <li>• Para modificar productos, use el módulo principal de Productos</li>
                        <li>• Los registros con estado BAJA_DEFINITIVA se muestran con opacidad reducida</li>
                    </ul>
                </div>

                {/* Modal de detalles */}
                {showDetail && selectedProduct && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Detalles del Producto
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowDetail(false);
                                            setSelectedProduct(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Sección 1: Identificación del Producto */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 uppercase tracking-wide">
                                        📋 Identificación del Producto
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 block mb-1">N° Inventario</span>
                                            <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                                                {selectedProduct.inventory_number}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 block mb-1">N° Serie</span>
                                            <p className="font-mono text-gray-900 dark:text-white">
                                                {selectedProduct.serial_number || '-'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 block mb-1">Descripción</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.description || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 block mb-1">Marca</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.brand || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-blue-700 dark:text-blue-400 block mb-1">Modelo</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.model || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 1.5: Imagen del Producto */}
                                {selectedProduct.product_image && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 uppercase tracking-wide">
                                            🖼️ Imagen del Producto
                                        </h3>
                                        <div className="flex justify-center">
                                            <img
                                                src={selectedProduct.product_image}
                                                alt="Imagen del producto"
                                                className="max-h-64 rounded-lg border border-blue-300 dark:border-blue-600 shadow-lg"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Sección 2: Estado y Clasificación */}
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                    <h3 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3 uppercase tracking-wide">
                                        ✅ Estado y Clasificación
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <span className="text-xs font-medium text-green-700 dark:text-green-400 block mb-1">Estado Actual</span>
                                            <p className="text-gray-900 dark:text-white font-semibold">
                                                {selectedProduct.product_status}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-green-700 dark:text-green-400 block mb-1">Motivo</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.reason || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-green-700 dark:text-green-400 block mb-1">Cantidad</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.quantity}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-green-700 dark:text-green-400 block mb-1">Condición</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.product_condition || 'BUENO'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 3: Datos de Origen */}
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3 uppercase tracking-wide">
                                        🏢 Datos de Origen
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <span className="text-xs font-medium text-purple-700 dark:text-purple-400 block mb-1">Centro de Trabajo</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.center_origin || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-purple-700 dark:text-purple-400 block mb-1">Folio de Referencia</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.reference_folio || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-medium text-purple-700 dark:text-purple-400 block mb-1">Entregado por</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedProduct.entregado_por_centro_trabajo || '-'}
                                            </p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <span className="text-xs font-medium text-purple-700 dark:text-purple-400 block mb-1">Fecha de Entrega</span>
                                            <p className="text-gray-900 dark:text-white">
                                                {formatDate(selectedProduct.fecha_entrega)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 4: Datos de Recepción */}
                                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                                    <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3 uppercase tracking-wide">
                                        📦 Datos de Recepción
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs font-medium text-orange-700 dark:text-orange-400 block mb-1">Recibido por (Chofer)</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {selectedProduct.recibido_por_chofer || '-'}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium text-orange-700 dark:text-orange-400 block mb-1">Fecha Recepción (Chofer)</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {formatDate(selectedProduct.fecha_recepcion_chofer)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="border-t border-orange-200 dark:border-orange-700 pt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400 block mb-1">Recibido por (Almacén)</span>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {selectedProduct.recibido_por_almacen || '-'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-medium text-orange-700 dark:text-orange-400 block mb-1">Fecha Recepción (Almacén)</span>
                                                    <p className="text-gray-900 dark:text-white">
                                                        {formatDate(selectedProduct.fecha_recepcion_almacen)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sección 5: Información Adicional */}
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-300 mb-3 uppercase tracking-wide">
                                        📝 Información Adicional
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-400 block mb-1">Notas/Observaciones</span>
                                            <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-600">
                                                {selectedProduct.notes || 'Sin notas adicionales'}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-400 block mb-1">Fecha de Registro</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {formatDate(selectedProduct.created_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-400 block mb-1">Fecha de Baja</span>
                                                <p className="text-gray-900 dark:text-white">
                                                    {formatDate(selectedProduct.fecha_baja)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de Acción */}
                            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDetail(false);
                                        setSelectedProduct(null);
                                    }}
                                    disabled={isDownloading}
                                    className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isDownloading}
                                    className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                                >
                                    {isDownloading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Descargando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Descargar PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
