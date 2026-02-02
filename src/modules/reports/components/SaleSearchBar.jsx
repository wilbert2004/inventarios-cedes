import React, { useState } from 'react';

/**
 * Buscador de movimientos específicos
 * Permite ingresar el ID de un movimiento y buscarlo
 */
export function SaleSearchBar({ onSaleFound, loading }) {
    const [saleId, setSaleId] = useState('');
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!saleId.trim()) {
            setError('Ingresa un número de movimiento');
            return;
        }

        try {
            setError('');
            // Llamar al backend para obtener detalles del movimiento
            const sale = await window.api.reports.getSaleDetail(parseInt(saleId));

            if (sale) {
                onSaleFound(sale);
            } else {
                setError('Movimiento no encontrado');
            }
        } catch (err) {
            setError(`Error: ${err.message}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Buscar Movimiento Específico
            </h3>

            <div className="flex gap-3">
                <div className="flex-1">
                    <input
                        type="number"
                        placeholder="Ingresa número de movimiento (ej: 5)"
                        value={saleId}
                        onChange={(e) => setSaleId(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {error && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}
                </div>
                <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="px-6 py-2 font-medium text-white transition-colors bg-blue-600 rounded-lg dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                    Buscar
                </button>
            </div>
        </div>
    );
}