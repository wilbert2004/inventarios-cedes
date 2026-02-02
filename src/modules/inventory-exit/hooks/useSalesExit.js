import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica de salida de productos
 */
export const useSalesExit = () => {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [exitCart, setExitCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Cargar productos disponibles
     */
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await window.api.products.getAll();
            setAllProducts(data || []);
            // Filtrar solo productos con stock > 0
            const filteredProducts = (data || []).filter(p => p.stock > 0);
            setProducts(filteredProducts);
        } catch (err) {
            setError(err.message || 'Error al cargar productos');
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

        return allProducts.find(
            (p) =>
                (p.barcode === term || p.name.toLowerCase().includes(term.toLowerCase())) &&
                p.stock > 0
        );
    }, [allProducts]);

    /**
     * Agregar producto al carrito de salida
     */
    const addToExitCart = useCallback((product, quantity = 1) => {
        // Validar cantidad
        if (quantity > product.stock) {
            throw new Error(`Stock disponible: ${product.stock}`);
        }

        setExitCart((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                const newQuantity = existing.quantity + quantity;
                if (newQuantity > product.stock) {
                    throw new Error(`No hay suficiente stock. Disponible: ${product.stock}`);
                }
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: newQuantity }
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
        setExitCart((prev) =>
            prev.map((item) =>
                item.id === productId
                    ? { ...item, quantity: Math.min(newQuantity, item.stock) }
                    : item
            )
        );
    }, []);

    /**
     * Eliminar producto del carrito
     */
    const removeFromCart = useCallback((productId) => {
        setExitCart((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    /**
     * Procesar salida de productos
     */
    const processExit = useCallback(async (exitData = {}) => {
        try {
            setProcessing(true);
            setError(null);

            const payload = {
                folio: exitData.folio,
                reason: exitData.reason,
                exit_date: exitData.exit_date,
                description: exitData.description,
                deliveredBy: exitData.deliveredBy || 'N/A',
                receivedBy: exitData.receivedBy || 'N/A',
                items: exitCart.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            };

            const result = await window.api.inventory.productExit(payload);

            if (result.success) {
                // Limpiar carrito
                setExitCart([]);
                // Recargar productos para ver stock actualizado
                await loadProducts();
                return { success: true, folio: result.folio, exit: result.exit };
            }

            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err.message || 'Error al procesar salida';
            setError(errorMessage);
            console.error('Error processing exit:', err);
            return { success: false, message: errorMessage };
        } finally {
            setProcessing(false);
        }
    }, [exitCart, loadProducts]);

    /**
     * Limpiar carrito
     */
    const clearCart = useCallback(() => {
        setExitCart([]);
    }, []);

    /**
     * Calcular totales
     */
    const totals = {
        totalProducts: exitCart.length,
        totalQuantity: exitCart.reduce((sum, item) => sum + item.quantity, 0),
        estimatedValue: exitCart.reduce(
            (sum, item) => sum + (item.sale_price || 0) * item.quantity,
            0
        ),
    };

    // Cargar productos al montar
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return {
        products,
        exitCart,
        loading,
        processing,
        error,
        totals,
        searchProduct,
        addToExitCart,
        updateQuantity,
        removeFromCart,
        processExit,
        clearCart,
        refreshProducts: loadProducts,
    };
};
