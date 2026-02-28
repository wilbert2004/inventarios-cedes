import { useMemo } from 'react';

/**
 * Componente de carrito para bienes en resguardo a dar de salida
 */
export function CustodyExitCart({ items, onRemoveItem }) {
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

    /**
     * Estadísticas del carrito
     */
    const stats = useMemo(() => {
        return {
            totalItems: items.length,
            totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
            byReason: items.reduce((acc, item) => {
                acc[item.reason] = (acc[item.reason] || 0) + 1;
                return acc;
            }, {}),
        };
    }, [items]);

    if (items.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow dark:bg-gray-800 p-8 text-center">
                <svg
                    className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
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
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                    No hay bienes en el carrito
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                    Busca y agrega bienes para procesar la salida
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow dark:bg-gray-800">
            {/* Encabezado con estadísticas */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        🛒 Bienes a Dar de Salida
                    </h3>
                    <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {stats.totalItems} item{stats.totalItems !== 1 ? 's' : ''}
                    </span>
                </div>

                {/* Estadísticas */}
                <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span>Cantidad total: {stats.totalQuantity}</span>
                    </div>
                </div>
            </div>

            {/* Lista de bienes */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => {
                    const daysInCustody = getDaysInCustody(item.created_at);
                    return (
                        <div
                            key={item.id}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        >
                            <div className="flex justify-between items-start gap-4">
                                {/* Información del bien */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    {/* Título */}
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            N° Inventario: {item.inventory_number}
                                        </p>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Detalles en grid */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400">
                                        {item.serial_number && (
                                            <div>
                                                <span className="font-medium">Serie:</span> {item.serial_number}
                                            </div>
                                        )}
                                        {item.brand && (
                                            <div>
                                                <span className="font-medium">Marca:</span> {item.brand}
                                            </div>
                                        )}
                                        {item.model && (
                                            <div>
                                                <span className="font-medium">Modelo:</span> {item.model}
                                            </div>
                                        )}
                                        {item.center_origin && (
                                            <div>
                                                <span className="font-medium">Centro Origen:</span> {item.center_origin}
                                            </div>
                                        )}
                                        <div>
                                            <span className="font-medium">Motivo Original:</span> {item.reason || 'N/A'}
                                        </div>
                                        <div>
                                            <span className="font-medium">En resguardo:</span> {daysInCustody} días
                                        </div>
                                    </div>

                                    {/* Estado */}
                                    <div>
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                            EN RESGUARDO
                                        </span>
                                    </div>
                                </div>

                                {/* Botón eliminar */}
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="flex-shrink-0 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title="Eliminar del carrito"
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
                    );
                })}
            </div>

            {/* Footer informativo */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-2">
                    <svg
                        className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                        <p className="font-medium mb-1">Información importante:</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                            <li>La salida es definitiva y no regresa al área original</li>
                            <li>El destino siempre es: <strong>Zona Principal</strong></li>
                            <li>Se requiere información de los 3 responsables</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
