import { useState } from 'react';

/**
 * Carrito de salida de bienes
 * Muestra los bienes a extraer y permite ajustar cantidades
 */
export function ExitCart({ items, products, onUpdateQuantity, onRemoveItem, isProcessing }) {
    const [expandedItem, setExpandedItem] = useState(null);

    /**
     * Obtener información del producto por ID
     */
    const getProductInfo = (productId) => {
        return products.find((p) => p.id === productId);
    };

    /**
     * Calcular stock restante después de la salida
     */
    const getStockAfterExit = (productId, quantity) => {
        const product = getProductInfo(productId);
        if (!product) return 0;
        return product.stock - quantity;
    };

    /**
     * Manejar cambio de cantidad
     */
    const handleQuantityChange = (productId, newQuantity) => {
        const product = getProductInfo(productId);
        if (!product) return;

        // Validar que no exceda el stock disponible
        const quantity = Math.min(newQuantity, product.stock);

        if (quantity > 0) {
            onUpdateQuantity(productId, quantity);
        }
    };

    if (items.length === 0) {
        return (
            <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="text-center py-8">
                    <svg
                        className="mx-auto mb-4 h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                    <p className="text-gray-500 dark:text-gray-400">
                        No hay bienes agregados. Busca y añade bienes a la salida.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Encabezado */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Productos para Salida ({items.length})
                </h3>
            </div>

            {/* Lista de productos */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => {
                    const product = getProductInfo(item.id);
                    const stockAfterExit = getStockAfterExit(item.id, item.quantity);
                    const isExpanded = expandedItem === item.id;

                    if (!product) return null;

                    return (
                        <div
                            key={item.productId}
                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                            {/* Fila principal */}
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 dark:text-white">
                                            {product.name}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Código: {product.barcode || 'N/A'}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() =>
                                            setExpandedItem(isExpanded ? null : item.id)
                                        }
                                        className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                    >
                                        {isExpanded ? '▼' : '▶'}
                                    </button>
                                </div>

                                {/* Información de cantidad en una línea cuando contraído */}
                                {!isExpanded && (
                                    <div className="mt-3 flex items-center justify-between">
                                        <div className="text-sm">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                Cantidad: <span className="font-semibold">{item.quantity}</span>
                                            </p>
                                        </div>
                                        <div className="text-sm text-right">
                                            <p className="text-gray-600 dark:text-gray-400">
                                                Stock: {product.stock}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                ${product.sale_price?.toFixed(2) || '0.00'} c/u
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detalles expandidos */}
                            {isExpanded && (
                                <div className="px-4 pb-4 bg-gray-50 dark:bg-gray-700/30 space-y-4">
                                    {/* Control de cantidad */}
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Cantidad a Extraer
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        Math.max(1, item.quantity - 1)
                                                    )
                                                }
                                                disabled={item.quantity === 1 || isProcessing}
                                                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                −
                                            </button>

                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                                                }
                                                disabled={isProcessing}
                                                min="1"
                                                max={product.stock}
                                                className="w-16 px-2 py-2 text-center rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white disabled:opacity-50"
                                            />

                                            <button
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        Math.min(product.stock, item.quantity + 1)
                                                    )
                                                }
                                                disabled={item.quantity >= product.stock || isProcessing}
                                                className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                +
                                            </button>

                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                / {product.stock} disponibles
                                            </span>
                                        </div>
                                    </div>

                                    {/* Información de stock */}
                                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 space-y-1">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Stock actual: <strong>{product.stock}</strong>
                                        </p>
                                        <p
                                            className={`text-sm font-medium ${stockAfterExit >= 0
                                                ? 'text-green-600 dark:text-green-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}
                                        >
                                            Stock después: <strong>{stockAfterExit}</strong>
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            Valor: ${(product.sale_price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Botón eliminar */}
                                    <button
                                        onClick={() => onRemoveItem(item.id)}
                                        disabled={isProcessing}
                                        className="w-full px-3 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Eliminar del carrito
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Resumen rápido */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Productos</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{items.length}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Cantidad</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {items.reduce((sum, item) => sum + item.quantity, 0)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Valor Total</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                            $
                            {items
                                .reduce((sum, item) => {
                                    const product = getProductInfo(item.id);
                                    return sum + (product?.sale_price || 0) * item.quantity;
                                }, 0)
                                .toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
