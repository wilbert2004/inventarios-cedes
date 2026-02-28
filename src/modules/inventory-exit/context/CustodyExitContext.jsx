import { createContext, useContext, useState, useCallback } from 'react';

/**
 * Contexto para manejar el carrito de salida de bienes
 * Persiste el estado durante toda la sesión del módulo
 */
const CustodyExitContext = createContext(null);

/**
 * Provider del contexto de salida de bienes
 */
export function CustodyExitProvider({ children }) {
    const [exitCart, setExitCart] = useState([]);

    /**
     * Agregar bien al carrito de salida
     */
    const addToExitCart = useCallback((product) => {
        setExitCart((prev) => {
            // Validar que no esté duplicado
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                throw new Error('Este bien ya está en el carrito');
            }
            return [...prev, { ...product }];
        });
    }, []);

    /**
     * Eliminar bien del carrito
     */
    const removeFromCart = useCallback((productId) => {
        setExitCart((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    /**
     * Limpiar carrito (solo se usa después de procesar o al cancelar)
     */
    const clearCart = useCallback(() => {
        setExitCart([]);
    }, []);

    /**
     * Calcular totales
     */
    const totals = {
        totalItems: exitCart.length,
        totalQuantity: exitCart.reduce((sum, item) => sum + (item.quantity || 1), 0),
    };

    const value = {
        exitCart,
        addToExitCart,
        removeFromCart,
        clearCart,
        totals,
    };

    return (
        <CustodyExitContext.Provider value={value}>
            {children}
        </CustodyExitContext.Provider>
    );
}

/**
 * Hook para usar el contexto de salida de bienes
 */
export function useCustodyExitContext() {
    const context = useContext(CustodyExitContext);
    if (!context) {
        throw new Error('useCustodyExitContext debe ser usado dentro de CustodyExitProvider');
    }
    return context;
}
