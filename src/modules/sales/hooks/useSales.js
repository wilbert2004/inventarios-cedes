import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';

/**
 * Custom hook para manejar la lógica de ventas
 */
export const useSales = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const searchInputRef = useRef(null);
  
  // Estados para modales de productos especiales
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [priceInput, setPriceInput] = useState('');

  /**
   * Cargar productos disponibles (solo activos, con stock o PRECIO_LIBRE)
   */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.api.products.getAll();
      // Filtrar productos activos: con stock > 0 o tipo PRECIO_LIBRE
      const activeProducts = data.filter(p => 
        p.active && (p.tipo_venta === 'PRECIO_LIBRE' || (p.stock > 0))
      );
      setProducts(activeProducts);
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar productos';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar producto por código de barras o nombre
   */
  const searchProduct = useCallback((term) => {
    if (!term.trim()) return null;

    return products.find(
      (p) => p.barcode === term || p.name.toLowerCase().includes(term.toLowerCase())
    );
  }, [products]);

  /**
   * Agregar producto al carrito (maneja diferentes tipos de venta)
   */
  const addToCart = useCallback((product, quantity = null, price = null) => {
    const tipoVenta = product.tipo_venta || 'UNIDAD';
    
    let finalQuantity = quantity;
    let finalPrice = price;
    
    if (tipoVenta === 'UNIDAD') {
      finalQuantity = quantity || 1;
      finalPrice = product.sale_price;
    } else if (tipoVenta === 'PESO') {
      finalQuantity = quantity || 0;
      finalPrice = product.sale_price; // precio por kg
    } else if (tipoVenta === 'PRECIO_LIBRE') {
      finalQuantity = 1; // siempre 1 para PRECIO_LIBRE
      finalPrice = price || 0;
    }
    
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem && tipoVenta === 'UNIDAD') {
        // Solo incrementar cantidad para productos por unidad
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { 
        ...product, 
        quantity: finalQuantity,
        price: finalPrice
      }];
    });
  }, []);

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = useCallback((id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  }, []);

  /**
   * Actualizar cantidad de un producto en el carrito
   */
  const updateQuantity = useCallback((id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }

    // Verificar stock disponible solo para productos que manejan inventario
    const product = products.find(p => p.id === id);
    const cartItem = cart.find(item => item.id === id);
    
    if (product && product.tipo_venta !== 'PRECIO_LIBRE') {
      if (newQuantity > product.stock) {
        const errorMsg = `Stock insuficiente. Disponible: ${product.stock} ${product.tipo_venta === 'PESO' ? 'kg' : 'piezas'}`;
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        return;
      }
    }

    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  }, [products, removeFromCart, cart]);

  /**
   * Confirmar peso para producto PESO
   */
  const confirmWeight = useCallback(() => {
    const weight = parseFloat(weightInput);
    if (!weight || weight <= 0) {
      setErrorMessage('El peso debe ser mayor a 0');
      setShowErrorModal(true);
      return;
    }
    
    if (pendingProduct) {
      const product = products.find(p => p.id === pendingProduct.id);
      if (product && product.tipo_venta === 'PESO' && weight > product.stock) {
        setErrorMessage(`Stock insuficiente. Disponible: ${product.stock} kg`);
        setShowErrorModal(true);
        setShowWeightModal(false);
        setWeightInput('');
        setPendingProduct(null);
        return;
      }
      
      // Si pendingProduct tiene cartItemIndex, significa que estamos editando
      if (pendingProduct.cartItemIndex !== undefined) {
        // Actualizar item existente en el carrito por índice
        setCart((prevCart) => {
          const newCart = [...prevCart];
          const itemToUpdate = newCart[pendingProduct.cartItemIndex];
          if (itemToUpdate && itemToUpdate.id === pendingProduct.id) {
            newCart[pendingProduct.cartItemIndex] = {
              ...itemToUpdate,
              quantity: weight
            };
          }
          return newCart;
        });
      } else {
        // Agregar nuevo producto
        addToCart(pendingProduct, weight, product.sale_price);
      }
      
      setShowWeightModal(false);
      setWeightInput('');
      setPendingProduct(null);
      setSearchTerm('');
      searchInputRef.current?.focus();
    }
  }, [weightInput, pendingProduct, products, addToCart]);

  /**
   * Confirmar precio para producto PRECIO_LIBRE
   */
  const confirmPrice = useCallback(() => {
    const price = parseFloat(priceInput);
    if (!price || price <= 0) {
      setErrorMessage('El monto debe ser mayor a 0');
      setShowErrorModal(true);
      return;
    }
    
    if (pendingProduct) {
      // Si pendingProduct tiene cartItemIndex, significa que estamos editando
      if (pendingProduct.cartItemIndex !== undefined) {
        // Actualizar item existente en el carrito por índice
        setCart((prevCart) => {
          const newCart = [...prevCart];
          const itemToUpdate = newCart[pendingProduct.cartItemIndex];
          if (itemToUpdate && itemToUpdate.id === pendingProduct.id) {
            newCart[pendingProduct.cartItemIndex] = {
              ...itemToUpdate,
              price: price
            };
          }
          return newCart;
        });
      } else {
        // Agregar nuevo producto
        addToCart(pendingProduct, 1, price);
      }
      
      setShowPriceModal(false);
      setPriceInput('');
      setPendingProduct(null);
      setSearchTerm('');
      searchInputRef.current?.focus();
    }
  }, [priceInput, pendingProduct, addToCart]);

  /**
   * Buscar y agregar producto al carrito
   */
  const handleSearch = useCallback((searchValue) => {
    if (!searchValue.trim()) return false;

    const product = searchProduct(searchValue);

    if (product) {
      const tipoVenta = product.tipo_venta || 'UNIDAD';
      
      // Verificar stock solo para productos que manejan inventario
      if (tipoVenta !== 'PRECIO_LIBRE') {
        const inCart = cart.find(item => item.id === product.id);
        const cartQuantity = inCart ? inCart.quantity : 0;
        
        if (cartQuantity >= product.stock) {
          const unit = tipoVenta === 'PESO' ? 'kg' : 'piezas';
          const errorMsg = `Stock insuficiente para ${product.name}. Disponible: ${product.stock} ${unit}`;
          setErrorMessage(errorMsg);
          setShowErrorModal(true);
          return false;
        }
      }

      // Manejar diferentes tipos de venta
      if (tipoVenta === 'PESO') {
        setPendingProduct(product);
        setShowWeightModal(true);
        return true;
      } else if (tipoVenta === 'PRECIO_LIBRE') {
        setPendingProduct(product);
        setShowPriceModal(true);
        return true;
      } else {
        // UNIDAD - flujo normal
        addToCart(product);
        setSearchTerm('');
        searchInputRef.current?.focus();
        return true;
      }
    } else {
      const errorMsg = `No se encontró ningún producto con el código o nombre: "${searchValue}"`;
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      return false;
    }
  }, [cart, searchProduct, addToCart]);

  /**
   * Editar peso de un producto PESO en el carrito
   */
  const editWeight = useCallback((cartItem, itemIndex) => {
    const product = products.find(p => p.id === cartItem.id);
    if (product && product.tipo_venta === 'PESO') {
      setPendingProduct({ ...product, cartItemIndex: itemIndex });
      setWeightInput(cartItem.quantity.toString());
      setShowWeightModal(true);
    }
  }, [products]);

  /**
   * Editar precio de un producto PRECIO_LIBRE en el carrito
   */
  const editPrice = useCallback((cartItem, itemIndex) => {
    const product = products.find(p => p.id === cartItem.id);
    if (product && product.tipo_venta === 'PRECIO_LIBRE') {
      setPendingProduct({ ...product, cartItemIndex: itemIndex });
      setPriceInput(cartItem.price.toString());
      setShowPriceModal(true);
    }
  }, [products]);

  /**
   * Cerrar modal de peso
   */
  const closeWeightModal = useCallback(() => {
    setShowWeightModal(false);
    setWeightInput('');
    setPendingProduct(null);
    searchInputRef.current?.focus();
  }, []);

  /**
   * Cerrar modal de precio
   */
  const closePriceModal = useCallback(() => {
    setShowPriceModal(false);
    setPriceInput('');
    setPendingProduct(null);
    searchInputRef.current?.focus();
  }, []);

  /**
   * Procesar venta
   */
  const processSale = useCallback(async () => {
    const total = cart.reduce((sum, item) => {
      // Para PRECIO_LIBRE, el precio ya es el total
      // Para otros tipos, multiplicar precio * cantidad
      if (item.tipo_venta === 'PRECIO_LIBRE') {
        return sum + item.price;
      }
      return sum + item.price * item.quantity;
    }, 0);
    const payment = parseFloat(paymentAmount) || 0;

    if (payment < total) return { success: false, error: 'El pago es insuficiente' };
    if (cart.length === 0) return { success: false, error: 'El carrito está vacío' };

    setProcessing(true);
    setError(null);

    try {
      // Preparar datos de la venta
      const saleData = {
        userId: user?.id || 1,
        total: total,
        paymentMethod: 'cash', // TODO: permitir seleccionar método de pago
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
        }))
      };

      // Procesar la venta
      const result = await window.api.sales.create(saleData);

      if (result.success) {
        // Calcular información antes de limpiar el carrito
        const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        const change = payment - total;
        
        // Limpiar carrito y formulario
        setCart([]);
        setPaymentAmount('');

        // Mostrar toast de éxito
        setSuccessMessage(
          `Venta completada: ${itemsCount} artículo(s) - Total: $${total.toFixed(2)} - Cambio: $${change.toFixed(2)}`
        );
        setShowSuccessToast(true);

        // Ocultar toast después de 4 segundos
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 4000);

        // Recargar productos para actualizar stock
        await loadProducts();

        // Enfocar el campo de búsqueda para continuar
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);

        return { success: true, sale: result.sale };
      }

      return { success: false, error: 'Error al procesar la venta' };
    } catch (err) {
      const errorMsg = err.message || 'Error al procesar la venta';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      console.error('Error processing sale:', err);
      return { success: false, error: errorMsg };
    } finally {
      setProcessing(false);
    }
  }, [cart, paymentAmount, user, loadProducts]);

  /**
   * Cancelar venta
   */
  const cancelSale = useCallback(() => {
    if (cart.length > 0 && window.confirm('¿Estás seguro de cancelar esta venta?')) {
      setCart([]);
      setPaymentAmount('');
      searchInputRef.current?.focus();
      return true;
    }
    return false;
  }, [cart]);

  /**
   * Cerrar modal de error
   */
  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
    searchInputRef.current?.focus();
  }, []);

  /**
   * Cerrar toast de éxito
   */
  const closeSuccessToast = useCallback(() => {
    setShowSuccessToast(false);
  }, []);

  /**
   * Calcular totales
   */
  const total = cart.reduce((sum, item) => {
    // Para PRECIO_LIBRE, el precio ya es el total
    // Para otros tipos, multiplicar precio * cantidad
    if (item.tipo_venta === 'PRECIO_LIBRE') {
      return sum + item.price;
    }
    return sum + item.price * item.quantity;
  }, 0);
  const payment = parseFloat(paymentAmount) || 0;
  const change = payment - total;

  // Cargar productos al montar
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Auto-focus en el campo de búsqueda al montar
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  return {
    // Estados
    cart,
    searchTerm,
    setSearchTerm,
    paymentAmount,
    setPaymentAmount,
    products,
    loading,
    processing,
    error,
    showErrorModal,
    errorMessage,
    showSuccessToast,
    successMessage,
    searchInputRef,
    
    // Estados de modales especiales
    showWeightModal,
    showPriceModal,
    weightInput,
    setWeightInput,
    priceInput,
    setPriceInput,
    pendingProduct,
    
    // Totales calculados
    total,
    payment,
    change,
    
    // Funciones
    handleSearch,
    addToCart,
    updateQuantity,
    removeFromCart,
    processSale,
    cancelSale,
    closeErrorModal,
    closeSuccessToast,
    confirmWeight,
    confirmPrice,
    closeWeightModal,
    closePriceModal,
    editWeight,
    editPrice,
    refreshProducts: loadProducts,
  };
};
