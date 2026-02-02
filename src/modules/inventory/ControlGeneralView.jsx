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

    return (
        <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                📚 Control General - Relación Histórica
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Registro completo de todos los productos • Solo consulta • Sin edición
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
                                Para modificar productos, use el módulo de Productos.
                            </p>
                        </div>
                    </div>
                </div>

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
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Detalles del Producto
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowDetail(false);
                                            setSelectedProduct(null);
                                        }}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">N° Inventario</span>
                                        <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                            {selectedProduct.inventory_number}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">N° Serie</span>
                                        <p className="font-mono text-gray-900 dark:text-white">
                                            {selectedProduct.serial_number || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Descripción</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.description || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Centro de Trabajo</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.center_origin || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Marca</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.brand || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Modelo</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.model || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Cantidad</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.quantity}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Motivo</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.reason || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Estado Actual</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.product_status}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Folio</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.reference_folio || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Entregado por (Centro)</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.entregado_por_centro_trabajo || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Fecha de Entrega</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {formatDate(selectedProduct.fecha_entrega)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Recibido por (Chofer)</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.recibido_por_chofer || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Fecha Recepción (Chofer)</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {formatDate(selectedProduct.fecha_recepcion_chofer)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Recibido por (Almacén)</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.recibido_por_almacen || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Fecha Recepción (Almacén)</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {formatDate(selectedProduct.fecha_recepcion_almacen)}
                                        </p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-gray-500 dark:text-gray-400">Notas</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {selectedProduct.notes || '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Fecha Registro</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {formatDate(selectedProduct.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 dark:text-gray-400">Fecha Baja</span>
                                        <p className="text-gray-900 dark:text-white">
                                            {formatDate(selectedProduct.fecha_baja)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
