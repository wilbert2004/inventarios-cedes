import React from 'react';

/**
 * Componente de tabla de bienes en custodia
 */
export const CustodyProductTable = ({ products, loading, onEdit, onDelete, onChangeStatus, onViewHistory }) => {
    const statusLabels = {
        EN_TRANSITO: 'EN TRANSITO',
        EN_RESGUARDO: 'EN RESGUARDO',
        BAJA_DEFINITIVA: 'BAJA DEFINITIVA',
    };

    const getStatusColor = (status) => {
        const colors = {
            'EN_TRANSITO': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
            'EN_RESGUARDO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            'BAJA_DEFINITIVA': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    };

    const getReasonBadge = (reason) => {
        const badges = {
            'BAJA': 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200',
            'RESGUARDO': 'bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200',
            'TRASLADO': 'bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-200',
        };
        return badges[reason] || 'bg-gray-200 text-gray-900 dark:bg-gray-900/50 dark:text-gray-200';
    };

    if (loading) {
        return (
            <div className="p-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 mb-4 border-b-2 border-blue-600 rounded-full dark:border-blue-400 animate-spin"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando productos...</p>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="p-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-center">
                    <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                    </svg>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                        No hay bienes registrados
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Comienza registrando un nuevo bien
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                N° Inventario
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Descripción
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Marca/Modelo
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Motivo
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                        {product.inventory_number}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                                        {product.description}
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        {product.brand && <span>{product.brand}</span>}
                                        {product.brand && product.model && <span> / </span>}
                                        {product.model && <span>{product.model}</span>}
                                        {!product.brand && !product.model && <span className="text-gray-400">-</span>}
                                    </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getReasonBadge(product.reason)}`}>
                                        {product.reason}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusColor(product.product_status)}`}>
                                        {statusLabels[product.product_status] || product.product_status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <div className="flex gap-2 justify-end">
                                        {product.product_status !== 'BAJA_DEFINITIVA' && (
                                            <>
                                                <button
                                                    onClick={() => onEdit(product)}
                                                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition"
                                                    title="Editar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => onChangeStatus(product)}
                                                    className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition"
                                                    title="Cambiar estado"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4h12a2 2 0 012 2v4" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => onViewHistory(product)}
                                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition"
                                            title="Ver historial"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                        {product.product_status !== 'BAJA_DEFINITIVA' && (
                                            <button
                                                onClick={() => onDelete(product)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition"
                                                title="Dar de baja"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H4v2h16V7h-3z" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                Total de productos: <span className="font-semibold text-gray-900 dark:text-white">{products.length}</span>
            </div>
        </div>
    );
};
