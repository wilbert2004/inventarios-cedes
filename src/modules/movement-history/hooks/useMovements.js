import { useEffect, useMemo, useState } from 'react';

export function useMovements() {
    const [filters, setFilters] = useState({
        productQuery: '',
        reference: '',
        type: '', // 'IN' | 'OUT' | ''
        startDate: '',
        endDate: '',
        limit: 200,
    });
    const [loading, setLoading] = useState(false);
    const [movements, setMovements] = useState([]);

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const data = await window.api.inventory.getMovements(filters);
            setMovements(data || []);
        } catch (err) {
            console.error('Error cargando movimientos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMovements();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const applyFilters = (partial) => {
        setFilters((prev) => ({ ...prev, ...partial }));
    };

    const refresh = () => fetchMovements();

    const stats = useMemo(() => {
        const total = movements.length;
        const inCount = movements.filter(m => m.type === 'IN').length;
        const outCount = movements.filter(m => m.type === 'OUT').length;
        const quantityIn = movements.filter(m => m.type === 'IN').reduce((s, m) => s + (m.quantity || 0), 0);
        const quantityOut = movements.filter(m => m.type === 'OUT').reduce((s, m) => s + (m.quantity || 0), 0);
        return { total, inCount, outCount, quantityIn, quantityOut };
    }, [movements]);

    return { filters, movements, loading, stats, applyFilters, refresh };
}
