import * as React from 'react';

export function FilterBar({ filters, onChange, onSearch, onClear }) {
    return (
        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-5">
            <input
                value={filters.productQuery || ''}
                onChange={(e) => onChange({ productQuery: e.target.value })}
                placeholder="Producto o código"
                className="px-3 py-2 border rounded"
            />
            <input
                value={filters.reference || ''}
                onChange={(e) => onChange({ reference: e.target.value })}
                placeholder="Folio/Referencia"
                className="px-3 py-2 border rounded"
            />
            <select
                value={filters.type || ''}
                onChange={(e) => onChange({ type: e.target.value })}
                className="px-3 py-2 border rounded"
            >
                <option value="">Tipo</option>
                <option value="IN">Entrada</option>
                <option value="OUT">Salida</option>
            </select>
            <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onChange({ startDate: e.target.value })}
                className="px-3 py-2 border rounded"
            />
            <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onChange({ endDate: e.target.value })}
                className="px-3 py-2 border rounded"
            />
            <div className="flex gap-2 md:col-span-5">
                <button onClick={onSearch} className="px-3 py-2 text-white bg-blue-600 rounded">Buscar</button>
                <button onClick={onClear} className="px-3 py-2 bg-gray-200 rounded">Limpiar</button>
            </div>
        </div>
    );
}
