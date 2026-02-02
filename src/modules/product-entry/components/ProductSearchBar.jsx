import * as React from 'react';
import { useState, useRef, useEffect } from 'react';

/**
 * Componente de barra de búsqueda para entrada de productos
 */
export const ProductSearchBar = ({ onProductFound, onProductNotFound }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [quantity, setQuantity] = useState('1');
  const searchInputRef = useRef(null);

  // Auto-focus en el campo de búsqueda
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  /**
   * Manejar búsqueda
   */
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;

    const qty = parseInt(quantity) || 1;
    
    if (qty <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    // Notificar a la vista principal
    onProductFound(searchTerm, qty);
    
    // Limpiar campos
    setSearchTerm('');
    setQuantity('1');
    searchInputRef.current?.focus();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
        {/* Campo de búsqueda */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500"
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
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escanea código de barras o busca por nombre..."
            className="w-full py-3 pl-10 pr-4 text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Campo de cantidad */}
        <div className="w-full md:w-32">
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            placeholder="Cant."
            className="w-full px-4 py-3 text-center text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Botón agregar */}
        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 whitespace-nowrap"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Agregar
        </button>
      </form>
    </div>
  );
};

