import * as React from 'react';
import { useState, useEffect } from 'react';

/**
 * Componente del carrito de entrada de productos
 * Soporta cantidad y estado (condition) de cada producto
 */
export const EntryCart = ({ items, onUpdateQuantity, onRemove, onUpdateCondition }) => {
  // Estado local para los valores de cantidad mientras se editan
  const [quantityInputs, setQuantityInputs] = useState({});

  // Limpiar estados locales de items que ya no están en el carrito
  useEffect(() => {
    const itemIds = new Set(items.map((item) => item.id));
    setQuantityInputs((prev) => {
      const cleaned = {};
      Object.keys(prev).forEach((id) => {
        if (itemIds.has(Number(id))) {
          cleaned[id] = prev[id];
        }
      });
      return cleaned;
    });
  }, [items]);
  if (items.length === 0) {
    return (
      <div className="p-12 bg-white rounded-lg shadow-sm dark:bg-gray-800">
        <div className="text-center">
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
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No hay productos para ingresar
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Escanea o busca productos para comenzar la entrada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Productos a Ingresar ({items.length})
        </h2>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                {item.barcode && (
                  <p className="font-mono text-sm text-gray-500 dark:text-gray-400">{item.barcode}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stock actual: <span className="font-semibold">{item.stock}</span> →{' '}
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {item.stock + item.quantity}
                  </span>
                </p>

                {/* Selector de estado/condición */}
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Estado:
                  </label>
                  <select
                    value={item.condition || 'GOOD'}
                    onChange={(e) => onUpdateCondition && onUpdateCondition(item.id, e.target.value)}
                    className="ml-2 px-2 py-1 text-sm border border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GOOD">✓ Bueno</option>
                    <option value="DAMAGED">⚠ Dañado</option>
                    <option value="DEFECTIVE">✗ Defectuoso</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Control de cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="flex items-center justify-center w-8 h-8 font-bold text-gray-700 transition-colors bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantityInputs[item.id] !== undefined ? quantityInputs[item.id] : item.quantity}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      // Permitir valores vacíos temporalmente
                      if (inputValue === '') {
                        setQuantityInputs((prev) => ({ ...prev, [item.id]: '' }));
                        return;
                      }
                      const numValue = parseInt(inputValue);
                      // Si es un número válido y mayor a 0, actualizar la cantidad
                      if (!isNaN(numValue) && numValue > 0) {
                        setQuantityInputs((prev) => {
                          const newState = { ...prev };
                          delete newState[item.id];
                          return newState;
                        });
                        onUpdateQuantity(item.id, numValue);
                      } else {
                        // Si es 0, negativo, o no es un número, guardar en estado local pero no actualizar
                        // Esto permite que el usuario vea lo que está escribiendo
                        setQuantityInputs((prev) => ({ ...prev, [item.id]: inputValue }));
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value;
                      // Si está vacío al perder el foco, poner 1
                      if (inputValue === '' || inputValue === '0') {
                        setQuantityInputs((prev) => {
                          const newState = { ...prev };
                          delete newState[item.id];
                          return newState;
                        });
                        onUpdateQuantity(item.id, 1);
                      } else {
                        // Limpiar el estado local si hay un valor válido
                        const numValue = parseInt(inputValue);
                        if (!isNaN(numValue) && numValue > 0) {
                          setQuantityInputs((prev) => {
                            const newState = { ...prev };
                            delete newState[item.id];
                            return newState;
                          });
                        }
                      }
                    }}
                    onFocus={(e) => {
                      // Al enfocar, guardar el valor actual en el estado local para permitir edición
                      setQuantityInputs((prev) => ({ ...prev, [item.id]: item.quantity }));
                    }}
                    min="1"
                    className="w-20 px-2 py-1 text-center text-gray-900 bg-white border border-gray-300 rounded-md outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="flex items-center justify-center w-8 h-8 font-bold text-gray-700 transition-colors bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    +
                  </button>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  title="Eliminar"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

