import { useState, useCallback, useMemo } from 'react';

/**
 * Componente de búsqueda de productos para salida
 * Permite buscar por código de barras o nombre
 */
export function ExitProductSearch({ products, onSelectProduct, isLoading = false }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);

    /**
     * Filtrar productos basado en búsqueda
     */
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase();
        return products.filter(
            (p) =>
                (p.barcode && p.barcode.toLowerCase().includes(query)) ||
                (p.name && p.name.toLowerCase().includes(query))
        );
    }, [searchQuery, products]);

    /**
     * Manejar selección de producto
     */
    const handleSelectProduct = useCallback(
        (product) => {
            onSelectProduct(product);
            setSearchQuery('');
            setShowResults(false);
        },
        [onSelectProduct]
    );

    /**
     * Manejar tecla Enter para buscar
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && filteredProducts.length > 0) {
            handleSelectProduct(filteredProducts[0]);
        }
    };

    return (
        <div className="relative">
            <div className="mb-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Buscar Producto <span className="text-gray-500">(código o nombre)</span>
                    </label>

                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={() => setShowResults(true)}
                            placeholder="Ingresa código de barras o nombre del producto..."
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
                        />

                        {/* Dropdown de resultados */}
                        {showResults && searchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                                {isLoading && (
                                    <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                                        Cargando...
                                    </div>
                                )}

                                {!isLoading && filteredProducts.length === 0 && (
                                    <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                                        No se encontraron productos
                                    </div>
                                )}

                                {!isLoading &&
                                    filteredProducts.map((product) => (
                                        <button
                                            key={product.id}
                                            onClick={() => handleSelectProduct(product)}
                                            type="button"
                                            className="w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                        >
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Código: {product.barcode || 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        Stock: {product.stock}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        ${product.sale_price?.toFixed(2) || '0.00'}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Información de ayuda */}
            <div className="p-3 text-xs text-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300">
                <strong>💡 Consejo:</strong> Solo puedes extraer productos que tengan stock disponible.
            </div>
        </div>
    );
}
