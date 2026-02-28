import { useState, useEffect, useCallback } from 'react';
import { useCustodyExitContext } from '../context/CustodyExitContext';

/**
 * Custom hook para manejar la lógica de salida de bienes en resguardo
 * Usa el contexto para persistencia del carrito dentro del módulo
 */
export const useCustodyExit = () => {
    const [custodyProducts, setCustodyProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // Obtener el carrito del contexto (persistente en el módulo)
    const { exitCart, addToExitCart, removeFromCart, clearCart, totals } = useCustodyExitContext();

    /**
     * Cargar productos en resguardo (solo EN_RESGUARDO)
     */
    const loadCustodyProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await window.api.custodyProducts.getAll();

            // Filtrar solo productos EN_RESGUARDO
            const inCustody = (data || []).filter(p => p.product_status === 'EN_RESGUARDO');
            setCustodyProducts(inCustody);
        } catch (err) {
            setError(err.message || 'Error al cargar productos en resguardo');
            console.error('Error loading custody products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Buscar producto por número de inventario, descripción o serie
     */
    const searchProduct = useCallback((term) => {
        if (!term.trim()) return [];

        const query = term.toLowerCase();
        return custodyProducts.filter(
            (p) =>
                (p.inventory_number && p.inventory_number.toLowerCase().includes(query)) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.serial_number && p.serial_number.toLowerCase().includes(query)) ||
                (p.brand && p.brand.toLowerCase().includes(query)) ||
                (p.model && p.model.toLowerCase().includes(query))
        );
    }, [custodyProducts]);

    /**
     * Agregar bien al carrito de salida
     */
    const addToExitCartLocal = useCallback((product) => {
        addToExitCart(product);
    }, [addToExitCart]);

    /**
     * Eliminar bien del carrito
     */
    const removeFromCartLocal = useCallback((productId) => {
        removeFromCart(productId);
    }, [removeFromCart]);

    /**
     * Procesar salida de bienes en resguardo
     */
    const processExit = useCallback(async (exitData = {}) => {
        try {
            setProcessing(true);
            setError(null);

            const payload = {
                folio: exitData.folio,
                exit_date: exitData.exit_date,
                description: exitData.description,
                // Responsables
                deliveredBy: exitData.deliveredBy,
                deliveredByPosition: exitData.deliveredByPosition,
                transportedBy: exitData.transportedBy,
                transportedByLicense: exitData.transportedByLicense,
                receivedBy: exitData.receivedBy,
                receivedByPosition: exitData.receivedByPosition,
                // Destino (siempre Zona Principal)
                destination: 'Zona Principal',
                // Items
                items: exitCart.map((item) => ({
                    custodyProductId: item.id,
                    inventory_number: item.inventory_number,
                    description: item.description,
                })),
            };

            const result = await window.api.custodyExit.process(payload);

            if (result.success) {
                // Limpiar carrito (usando el del contexto)
                clearCart();
                // Recargar productos para actualizar disponibilidad
                await loadCustodyProducts();
                return { success: true, folio: result.folio };
            }

            return { success: false, message: result.message };
        } catch (err) {
            const errorMessage = err.message || 'Error al procesar salida';
            setError(errorMessage);
            console.error('Error processing custody exit:', err);
            return { success: false, message: errorMessage };
        } finally {
            setProcessing(false);
        }
    }, [exitCart, loadCustodyProducts, clearCart]);

    /**
     * Limpiar carrito
     */
    const clearCartLocal = useCallback(() => {
        clearCart();
    }, [clearCart]);

    /**
     * Calcular totales (ahora viene del contexto)
     */
    // const totals = {
    //     totalItems: exitCart.length,
    //     totalQuantity: exitCart.reduce((sum, item) => sum + (item.quantity || 1), 0),
    // };

    // Cargar productos al montar
    useEffect(() => {
        loadCustodyProducts();
    }, [loadCustodyProducts]);

    return {
        custodyProducts,
        exitCart,
        totals,
        loading,
        processing,
        error,
        searchProduct,
        addToExitCart: addToExitCartLocal,
        removeFromCart: removeFromCartLocal,
        processExit,
        clearCart: clearCartLocal,
        loadCustodyProducts,
    };
};
