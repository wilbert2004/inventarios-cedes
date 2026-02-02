import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica del historial de movimientos
 */
export const useSalesHistory = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /**
   * Cargar todas las ventas
   */
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.sales.getAll();
      setSales(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar ventas');
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener detalles de una venta
   */
  const loadSaleDetails = useCallback(async (saleId) => {
    try {
      const details = await window.api.sales.getById(saleId);
      setSelectedSale(details);
      setShowDetailModal(true);
    } catch (err) {
      setError(err.message || 'Error al cargar detalles de la venta');
      console.error('Error loading sale details:', err);
    }
  }, []);

  /**
   * Reimprimir ticket
   */
  const reprintTicket = useCallback(async (saleId) => {
    try {
      // Obtener detalles de la venta
      const saleDetails = await window.api.sales.getById(saleId);

      // Imprimir ticket
      await window.api.printer.printTicket({
        sale: saleDetails,
        items: saleDetails.items,
        payment: saleDetails.total, // No tenemos el pago exacto guardado
        change: 0, // No podemos calcular el cambio en reimpresión
      });
    } catch (err) {
      setError(err.message || 'Error al reimprimir ticket');
      console.error('Error reprinting ticket:', err);
    }
  }, []);

  /**
   * Filtrar ventas por término de búsqueda y fecha
   */
  const filteredSales = sales.filter((sale) => {
    // Filtro por búsqueda (ID de venta o total)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesId = sale.id.toString().includes(term);
      const matchesTotal = sale.total.toString().includes(term);
      if (!matchesId && !matchesTotal) return false;
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const saleDate = new Date(sale.created_at.replace(' ', 'T'));
      const now = new Date();

      switch (dateFilter) {
        case 'today': {
          const isToday =
            saleDate.getDate() === now.getDate() &&
            saleDate.getMonth() === now.getMonth() &&
            saleDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
          break;
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (saleDate < weekAgo) return false;
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (saleDate < monthAgo) return false;
          break;
        }
        default:
          break;
      }
    }

    return true;
  });

  /**
   * Calcular estadísticas
   */
  const statistics = {
    totalSales: filteredSales.length,
    totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
    totalItems: filteredSales.reduce((sum, sale) => sum + (sale.items_count || 0), 0),
    averageTicket: filteredSales.length > 0
      ? filteredSales.reduce((sum, sale) => sum + sale.total, 0) / filteredSales.length
      : 0,
  };

  // Cargar ventas al montar el componente
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales: filteredSales,
    allSales: sales,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    selectedSale,
    showDetailModal,
    setShowDetailModal,
    statistics,
    loadSales,
    loadSaleDetails,
    reprintTicket,
  };
};

