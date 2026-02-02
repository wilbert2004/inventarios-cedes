import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica de entrada de productos
 */
export const useProductEntry = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Lista completa para búsqueda
  const [entryCart, setEntryCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar productos disponibles (excluir PRECIO_LIBRE para el carrito)
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.products.getAll();
      // Guardar todos los productos para búsqueda
      setAllProducts(data || []);
      // Filtrar productos PRECIO_LIBRE ya que no manejan inventario (solo para mostrar en lista)
      const filteredProducts = (data || []).filter(p => p.tipo_venta !== 'PRECIO_LIBRE');
      setProducts(filteredProducts);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar producto por código de barras o nombre (busca en todos los productos)
   */
  const searchProduct = useCallback((term) => {
    if (!term.trim()) return null;

    return allProducts.find(
      (p) =>
        p.barcode === term ||
        p.name.toLowerCase().includes(term.toLowerCase())
    );
  }, [allProducts]);

  /**
   * Agregar producto al carrito de entrada
   */
  const addToEntryCart = useCallback((product, quantity = 1) => {
    // Validar que no sea producto PRECIO_LIBRE
    if (product.tipo_venta === 'PRECIO_LIBRE') {
      throw new Error('Los productos de precio variable no manejan inventario');
    }

    setEntryCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  /**
   * Actualizar cantidad de un producto en el carrito
   */
  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setEntryCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = useCallback((productId) => {
    setEntryCart((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  /**
   * Actualizar condición/estado de un producto en el carrito
   */
  const updateCondition = useCallback((productId, condition) => {
    setEntryCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, condition } : item
      )
    );
  }, []);

  /**
   * Procesar entrada de productos
   */
  const processEntry = useCallback(async (userId, entryData = {}) => {
    try {
      setProcessing(true);
      setError(null);

      const payload = {
        userId,
        folio: entryData.folio,
        provider: entryData.provider,
        entry_date: entryData.entry_date,
        description: entryData.description,
        items: entryCart.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          condition: item.condition || 'GOOD',
        })),
      };

      const result = await window.api.inventory.productEntry(payload);

      if (result.success) {
        // Limpiar carrito
        setEntryCart([]);
        // Recargar productos para ver stock actualizado
        await loadProducts();
        return { success: true, entry: result.entry };
      }

      return { success: false };
    } catch (err) {
      const errorMessage = err.message || 'Error al procesar entrada';
      setError(errorMessage);
      console.error('Error processing entry:', err);
      return { success: false, error: errorMessage };
    } finally {
      setProcessing(false);
    }
  }, [entryCart, loadProducts]);

  /**
   * Limpiar carrito
   */
  const clearCart = useCallback(() => {
    setEntryCart([]);
  }, []);

  /**
   * Crear un nuevo producto
   */
  const createProduct = useCallback(async (productData) => {
    try {
      setError(null);
      const createdProduct = await window.api.products.create(productData);
      await loadProducts();
      return { success: true, product: createdProduct };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear producto';
      setError(errorMessage);
      console.error('Error creating product:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadProducts]);

  /**
   * Calcular totales
   */
  const totals = {
    totalProducts: entryCart.length,
    totalQuantity: entryCart.reduce((sum, item) => sum + item.quantity, 0),
    estimatedValue: entryCart.reduce(
      (sum, item) => sum + item.purchase_cost * item.quantity,
      0
    ),
  };

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    entryCart,
    searchTerm,
    setSearchTerm,
    loading,
    processing,
    error,
    totals,
    searchProduct,
    addToEntryCart,
    updateQuantity,
    updateCondition,
    removeFromCart,
    processEntry,
    clearCart,
    createProduct,
    refreshProducts: loadProducts,
  };
};

