import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica del historial de entradas de bienes
 */
export const useEntryHistory = () => {
  const [movements, setMovements] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  /**
   * Cargar todos los movimientos de entrada
   */
  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Obtener solo movimientos de entrada (PRODUCT_ENTRY)
      const data = await window.api.inventory.getMovements({
        type: 'IN',
        reference: 'PRODUCT_ENTRY',
        limit: 1000, // Obtener más registros para agrupar
      });
      setMovements(data || []);

      // Agrupar movimientos por entrada (mismo timestamp y usuario)
      const grouped = groupMovementsByEntry(data || []);
      setEntries(grouped);
    } catch (err) {
      setError(err.message || 'Error al cargar entradas');
      console.error('Error loading entries:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Agrupar movimientos por entrada
   * Los movimientos de la misma entrada tienen el mismo timestamp (aproximado) y usuario
   */
  const groupMovementsByEntry = (movementsList) => {
    if (!movementsList || movementsList.length === 0) return [];

    // Agrupar por timestamp (redondeado a minutos) y usuario
    const grouped = {};

    movementsList.forEach((movement) => {
      const timestamp = new Date(movement.created_at);
      // Redondear a minutos para agrupar movimientos de la misma entrada
      const roundedTime = new Date(
        timestamp.getFullYear(),
        timestamp.getMonth(),
        timestamp.getDate(),
        timestamp.getHours(),
        timestamp.getMinutes()
      ).toISOString();

      const key = `${roundedTime}_${movement.user_id || 'unknown'}`;

      if (!grouped[key]) {
        grouped[key] = {
          id: movement.id, // Usar el primer ID como identificador
          timestamp: movement.created_at,
          userId: movement.user_id,
          userName: movement.user_name,
          items: [],
          totalItems: 0,
          totalQuantity: 0,
        };
      }

      grouped[key].items.push({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.product_name,
        productBarcode: movement.product_barcode,
        quantity: movement.quantity,
        type: movement.type,
        reference: movement.reference,
        createdAt: movement.created_at,
      });

      grouped[key].totalItems += 1;
      grouped[key].totalQuantity += movement.quantity;
    });

    // Convertir a array y ordenar por fecha descendente
    return Object.values(grouped).sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  };

  /**
   * Obtener detalles de una entrada
   */
  const loadEntryDetails = useCallback((entryId) => {
    const entry = entries.find((e) => e.id === entryId);
    if (entry) {
      setSelectedEntry(entry);
      setShowDetailModal(true);
    }
  }, [entries]);

  /**
   * Filtrar entradas por término de búsqueda y fecha
   */
  const filteredEntries = entries.filter((entry) => {
    // Filtro por búsqueda (ID, nombre de producto, usuario)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesId = entry.id.toString().includes(term);
      const matchesUser = entry.userName?.toLowerCase().includes(term);
      const matchesProduct = entry.items.some((item) =>
        item.productName?.toLowerCase().includes(term) ||
        item.productBarcode?.toLowerCase().includes(term)
      );
      if (!matchesId && !matchesUser && !matchesProduct) return false;
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      const entryDate = new Date(entry.timestamp);
      const now = new Date();

      switch (dateFilter) {
        case 'today': {
          const isToday =
            entryDate.getDate() === now.getDate() &&
            entryDate.getMonth() === now.getMonth() &&
            entryDate.getFullYear() === now.getFullYear();
          if (!isToday) return false;
          break;
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (entryDate < weekAgo) return false;
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (entryDate < monthAgo) return false;
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
    totalEntries: filteredEntries.length,
    totalProducts: filteredEntries.reduce((sum, entry) => sum + entry.totalItems, 0),
    totalQuantity: filteredEntries.reduce((sum, entry) => sum + entry.totalQuantity, 0),
    averageItemsPerEntry: filteredEntries.length > 0
      ? filteredEntries.reduce((sum, entry) => sum + entry.totalItems, 0) / filteredEntries.length
      : 0,
  };

  // Cargar movimientos al montar el componente
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  return {
    entries: filteredEntries,
    allEntries: entries,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    selectedEntry,
    showDetailModal,
    setShowDetailModal,
    statistics,
    loadMovements,
    loadEntryDetails,
  };
};

