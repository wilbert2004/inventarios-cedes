import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica de productos
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Cargar todos los productos
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.products.getAll();
      setProducts(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear un nuevo producto
   */
  const createProduct = useCallback(async (productData) => {
    try {
      setError(null);
      await window.api.products.create(productData);
      await loadProducts();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al crear producto';
      setError(errorMessage);
      console.error('Error creating product:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadProducts]);

  /**
   * Actualizar un producto existente
   */
  const updateProduct = useCallback(async (product, productData) => {
    try {
      setError(null);
      await window.api.products.update(product.id, productData);
      await loadProducts();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Error al actualizar producto';
      setError(errorMessage);
      console.error('Error updating product:', err);
      return { success: false, error: errorMessage };
    }
  }, [loadProducts]);

  /**
   * Filtrar productos por término de búsqueda
   */
  const filteredProducts = products.filter((product) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(term) ||
      (product.description && product.description.toLowerCase().includes(term)) ||
      (product.barcode && product.barcode.includes(searchTerm))
    );
  });



  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products: filteredProducts,
    allProducts: products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    createProduct,
    updateProduct,
    refreshProducts: loadProducts,
  };
};

