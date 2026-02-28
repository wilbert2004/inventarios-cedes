import { useState, useCallback, useMemo } from 'react';

/**
 * Componente de búsqueda de bienes en resguardo para salida
 * Permite buscar por N° inventario, descripción, serie, marca o modelo
 */
export function CustodyProductSearch({ products, onSelectProduct, isLoading = false }) {
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
                (p.inventory_number && p.inventory_number.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.serial_number && p.serial_number.toLowerCase().includes(query)) ||
                (p.brand && p.brand.toLowerCase().includes(query)) ||
                (p.model && p.model.toLowerCase().includes(query))
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
     * Calcular días en resguardo
     */
    const getDaysInCustody = (createdAt) => {
        if (!createdAt) return 0;
        const created = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - created);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="relative">
            <div className="mb-4 bg-white rounded-lg shadow dark:bg-gray-800">
                <div className="p-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        🔍 Buscar Bien en Resguardo
                    </label>
                    <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                        Buscar por N° Inventario, Descripción, Serie, Marca o Modelo
                    </p>

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
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowResults(true);
                            }}
                            onFocus={() => setShowResults(true)}
                            placeholder="Ej: 12345, Laptop, HP..."
                            disabled={isLoading}
                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50"
                        />

                        {/* Dropdown de resultados */}
                        {showResults && searchQuery && (
                            <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg dark:bg-gray-700 border border-gray-300 dark:border-gray-600 max-h-96 overflow-y-auto">
                                {isLoading && (
                                    <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                                        Cargando...
                                    </div>
                                )}

                                {!isLoading && filteredProducts.length === 0 && (
                                    <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                                        No se encontraron bienes en resguardo
                                    </div>
                                )}

                                {!isLoading &&
                                    filteredProducts.map((product) => {
                                        const daysInCustody = getDaysInCustody(product.created_at);
                                        return (
                                            <button
                                                key={product.id}
                                                onClick={() => handleSelectProduct(product)}
                                                type="button"
                                                className="w-full px-4 py-3 text-left transition-colors hover:bg-blue-50 dark:hover:bg-gray-600 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                                            >
                                                <div className="space-y-2">
                                                    {/* Título principal */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                N° Inv: {product.inventory_number}
                                                            </p>
                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                {product.description}
                                                            </p>
                                                        </div>
                                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                            EN RESGUARDO
                                                        </span>
                                                    </div>

                                                    {/* Detalles */}
                                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                                        {product.serial_number && (
                                                            <div>
                                                                <span className="font-medium">Serie:</span> {product.serial_number}
                                                            </div>
                                                        )}
                                                        {product.brand && (
                                                            <div>
                                                                <span className="font-medium">Marca:</span> {product.brand}
                                                            </div>
                                                        )}
                                                        {product.model && (
                                                            <div>
                                                                <span className="font-medium">Modelo:</span> {product.model}
                                                            </div>
                                                        )}
                                                        {product.center_origin && (
                                                            <div>
                                                                <span className="font-medium">Origen:</span> {product.center_origin}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex justify-between items-center pt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <span>
                                                            Motivo: {product.reason || 'N/A'}
                                                        </span>
                                                        <span className="font-medium">
                                                            {daysInCustody} días en resguardo
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        )}
                    </div>

                    {/* Contador de productos disponibles */}
                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span>
                            {products.length} bien{products.length !== 1 ? 'es' : ''} disponible{products.length !== 1 ? 's' : ''} en resguardo
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
