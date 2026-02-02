import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gestionar el inventario consolidado
 */
export function useInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | IN_STOCK | LOW_STOCK | OUT_OF_STOCK
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE
  const [tipoVentaFilter, setTipoVentaFilter] = useState('ALL'); // ALL | UNIDAD | PESO | PRECIO_LIBRE
  const [sortBy, setSortBy] = useState('name'); // name | stock | sale_price | purchase_cost | barcode
  const [sortDir, setSortDir] = useState('asc'); // asc | desc
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalStockValue: 0,
  });

  /**
   * Cargar productos con stock
   */
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.products.getAll();
      setProducts(data);
      calculateStatistics(data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calcular estadísticas del inventario
   */
  const calculateStatistics = (productsList) => {
    const active = productsList.filter((p) => p.active === 1);
    const lowStock = active.filter((p) => p.stock > 0 && p.stock <= lowStockThreshold);
    const outOfStock = active.filter((p) => p.stock === 0);
    const totalValue = active.reduce(
      (sum, p) => sum + p.stock * (p.purchase_cost || 0),
      0
    );

    setStatistics({
      totalProducts: productsList.length,
      activeProducts: active.length,
      lowStockProducts: lowStock.length,
      outOfStockProducts: outOfStock.length,
      totalStockValue: totalValue,
    });
  };

  /**
   * Filtrar productos según búsqueda y filtros
   */
  const filteredProducts = products.filter((product) => {
    // Filtro de búsqueda
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode &&
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro de stock bajo
    const matchesLowStock =
      !lowStockFilter || (product.active === 1 && product.stock > 0 && product.stock <= lowStockThreshold);

    // Filtro por estado (stock)
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'IN_STOCK' && product.active === 1 && product.stock > lowStockThreshold) ||
      (statusFilter === 'LOW_STOCK' && product.active === 1 && product.stock > 0 && product.stock <= lowStockThreshold) ||
      (statusFilter === 'OUT_OF_STOCK' && product.active === 1 && product.stock === 0);

    // Filtro por activo/inactivo
    const matchesActive =
      activeFilter === 'ALL' ||
      (activeFilter === 'ACTIVE' && product.active === 1) ||
      (activeFilter === 'INACTIVE' && product.active !== 1);

    // Filtro por tipo_venta
    const matchesTipoVenta =
      tipoVentaFilter === 'ALL' || product.tipo_venta === tipoVentaFilter;

    return matchesSearch && matchesLowStock && matchesStatus && matchesActive && matchesTipoVenta;
  });

  // Ordenamiento
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let va, vb;
    switch (sortBy) {
      case 'stock':
        va = a.stock || 0; vb = b.stock || 0; break;
      case 'sale_price':
        va = a.sale_price || 0; vb = b.sale_price || 0; break;
      case 'purchase_cost':
        va = a.purchase_cost || 0; vb = b.purchase_cost || 0; break;
      case 'barcode':
        va = (a.barcode || '').toLowerCase(); vb = (b.barcode || '').toLowerCase(); break;
      case 'name':
      default:
        va = (a.name || '').toLowerCase(); vb = (b.name || '').toLowerCase();
    }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  /**
   * Cargar productos al montar
   */
  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products: sortedProducts,
    allProducts: products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    lowStockFilter,
    setLowStockFilter,
    lowStockThreshold,
    setLowStockThreshold,
    statusFilter,
    setStatusFilter,
    activeFilter,
    setActiveFilter,
    tipoVentaFilter,
    setTipoVentaFilter,
    sortBy,
    sortDir,
    setSortBy,
    setSortDir,
    statistics,
    refreshInventory: loadProducts,
  };
}
