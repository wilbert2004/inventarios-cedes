import * as React from 'react';
import { FilterBar } from './components/FilterBar';
import { MovementsTable } from './components/MovementsTable';
import { useMovements } from './hooks/useMovements';

export default function MovementsView() {
    const { filters, movements, loading, stats, applyFilters, refresh } = useMovements();

    const handleSearch = async () => {
        await refresh();
    };

    const handleClear = async () => {
        applyFilters({ productQuery: '', reference: '', type: '', startDate: '', endDate: '' });
        await refresh();
    };

    const handleGeneratePDF = async () => {
        try {
            const reportData = {
                movements,
                dateRange: {
                    start: filters.startDate ? new Date(filters.startDate) : new Date(0),
                    end: filters.endDate ? new Date(filters.endDate) : new Date(),
                },
                summary: {
                    totalMovements: stats.total,
                    inCount: stats.inCount,
                    outCount: stats.outCount,
                    quantityIn: stats.quantityIn,
                    quantityOut: stats.quantityOut,
                },
            };

            const filePath = await window.api.reports.generatePDF(reportData, 'inventory-movements');
            if (filePath) {
                alert('PDF generado: ' + filePath);
            }
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Error al generar PDF');
        }
    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-xl font-semibold">Historial de Movimientos</h1>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 border rounded">
                    <p>Total registros: <strong>{stats.total}</strong></p>
                    <p>Entradas: <strong>{stats.inCount}</strong> (Cant. {stats.quantityIn})</p>
                    <p>Salidas: <strong>{stats.outCount}</strong> (Cant. {stats.quantityOut})</p>
                </div>
                <div className="flex items-end gap-2">
                    <button onClick={refresh} className="px-3 py-2 text-white bg-blue-600 rounded">Actualizar</button>
                    <button onClick={handleGeneratePDF} className="px-3 py-2 text-white bg-green-600 rounded">PDF</button>
                </div>
            </div>

            <FilterBar
                filters={filters}
                onChange={applyFilters}
                onSearch={handleSearch}
                onClear={handleClear}
            />

            {loading ? (
                <div className="p-6 text-center">Cargando...</div>
            ) : (
                <MovementsTable movements={movements} />
            )}
        </div>
    );
}
