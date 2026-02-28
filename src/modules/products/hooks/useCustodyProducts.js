import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook para manejar la lógica de bienes en custodia (CEDES)
 */
export const useCustodyProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statistics, setStatistics] = useState(null);
    const [statusFilter, setStatusFilter] = useState(''); // Filtro por estado
    const [reasonFilter, setReasonFilter] = useState(''); // Filtro por motivo

    /**
     * Cargar todos los productos
     */
    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await window.api.custodyLifecycle.getAll({});
            setProducts(data || []);
        } catch (err) {
            const errorMessage = err.message || 'Error al cargar productos';
            setError(errorMessage);
            console.error('Error loading custody products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cargar estadísticas
     */
    const loadStatistics = useCallback(async () => {
        try {
            const stats = await window.api.custodyLifecycle.getStatistics();
            console.log("Statistics loaded:", stats);
            setStatistics(stats);
        } catch (err) {
            console.error('Error loading statistics:', err);
            // Mantener estadísticas vacías pero válidas
            setStatistics({
                totalProducts: 0,
                totalQuantity: 0,
                byStatus: [],
                byReason: []
            });
        }
    }, []);

    /**
     * Crear uno o múltiples productos en resguardo
     * Soporta tanto un solo producto como un array de productos
     */
    const createProduct = useCallback(async (productData) => {
        try {
            setError(null);

            // Si productData tiene estructura de múltiples productos
            if (productData.products && Array.isArray(productData.products)) {
                // Combinar datos generales con cada producto
                const generalData = productData.general || {};
                const enrichedProducts = productData.products.map(product => ({
                    ...generalData,
                    ...product,
                }));

                // Validar todos los productos antes de registrar
                for (const product of enrichedProducts) {
                    // Validaciones básicas
                    if (!product.inventory_number) {
                        throw new Error("El número de inventario es requerido para todos los productos");
                    }
                    if (!product.center_origin) {
                        throw new Error("El centro de origen es requerido para todos los productos");
                    }
                }

                // Crear múltiples productos
                const results = [];
                let successCount = 0;
                let failureCount = 0;
                const errors = [];

                for (const product of enrichedProducts) {
                    try {
                        const result = await window.api.custodyLifecycle.register(product);
                        results.push(result);
                        successCount++;
                    } catch (err) {
                        failureCount++;
                        errors.push(`Producto ${product.inventory_number}: ${err.message}`);
                    }
                }

                // Si hay fallos, reportar cuáles productos fallaron
                if (failureCount > 0) {
                    const errorMessage = `Se registraron ${successCount} de ${enrichedProducts.length} productos. Errores:\n${errors.join('\n')}`;
                    throw new Error(errorMessage);
                }

                await loadProducts();
                await loadStatistics();
                return { success: true, created: successCount };
            } else {
                // Crear un solo producto
                await window.api.custodyLifecycle.register(productData);
                await loadProducts();
                await loadStatistics();
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.message || 'Error al crear producto';
            setError(errorMessage);
            console.error('Error creating custody product:', err);
            return { success: false, error: errorMessage };
        }
    }, [loadProducts, loadStatistics]);

    /**
     * Actualizar un producto existente
     */
    const updateProduct = useCallback(async (id, productData) => {
        try {
            setError(null);
            // Agregar productId al objeto de datos
            const updateData = { ...productData, productId: id };
            await window.api.custodyLifecycle.update(updateData);
            await loadProducts();
            await loadStatistics();
            return { success: true };
        } catch (err) {
            const errorMessage = err.message || 'Error al actualizar producto';
            setError(errorMessage);
            console.error('Error updating custody product:', err);
            return { success: false, error: errorMessage };
        }
    }, [loadProducts, loadStatistics]);

    /**
     * Cambiar el estado de un producto
     */
    const changeProductStatus = useCallback(async (productId, newStatus, reasonChange, changedBy, receptionData = {}) => {
        try {
            setError(null);

            // Solo permitir cambio a EN_RESGUARDO
            if (newStatus === 'EN_RESGUARDO' && receptionData.recibido_por_almacen) {
                await window.api.custodyLifecycle.registerWarehouseReception({
                    productId,
                    recibido_por_almacen: receptionData.recibido_por_almacen,
                    fecha_recepcion_almacen: receptionData.fecha_recepcion_almacen,
                    userId: changedBy
                });

                await window.api.custodyLifecycle.changeStatus({
                    productId,
                    newStatus,
                    reason: reasonChange || '',
                    userId: changedBy
                });
            } else {
                // Cambio de estado genérico
                await window.api.custodyLifecycle.changeStatus({
                    productId,
                    newStatus,
                    reason: reasonChange || '',
                    userId: changedBy
                });
            }

            await loadProducts();
            await loadStatistics();
            return { success: true };
        } catch (err) {
            const errorMessage = err.message || 'Error al cambiar estado';
            setError(errorMessage);
            console.error('Error changing product status:', err);
            return { success: false, error: errorMessage };
        }
    }, [loadProducts, loadStatistics]);

    /**
     * Obtener el historial de un producto
     */
    const getProductHistory = useCallback(async (productId) => {
        try {
            const history = await window.api.custodyLifecycle.getHistory(productId);
            return history || [];
        } catch (err) {
            console.error('Error fetching product history:', err);
            throw err;
        }
    }, []);

    /**
     * Buscar productos
     */
    const searchProducts = useCallback(async (query) => {
        try {
            setSearchTerm(query);
            if (!query.trim()) {
                await loadProducts();
                return;
            }
            setLoading(true);
            const results = await window.api.custodyLifecycle.getAll({ search: query });
            setProducts(results || []);
        } catch (err) {
            console.error('Error searching products:', err);
            setError('Error al buscar productos');
        } finally {
            setLoading(false);
        }
    }, [loadProducts]);

    /**
     * Filtrar por estado
     */
    const filterByStatus = useCallback(async (status) => {
        try {
            setStatusFilter(status);
            if (!status) {
                await loadProducts();
                return;
            }
            setLoading(true);
            const results = await window.api.custodyLifecycle.getAll({ status });
            setProducts(results || []);
        } catch (err) {
            console.error('Error filtering by status:', err);
            setError('Error al filtrar por estado');
        } finally {
            setLoading(false);
        }
    }, [loadProducts]);

    /**
     * Filtrar por motivo
     */
    const filterByReason = useCallback(async (reason) => {
        try {
            setReasonFilter(reason);
            if (!reason) {
                await loadProducts();
                return;
            }
            setLoading(true);
            const results = await window.api.custodyLifecycle.getAll({ reason });
            setProducts(results || []);
        } catch (err) {
            console.error('Error filtering by reason:', err);
            setError('Error al filtrar por motivo');
        } finally {
            setLoading(false);
        }
    }, [loadProducts]);

    /**
     * Exportar productos
     */
    const exportProducts = useCallback(async () => {
        try {
            const data = await window.api.custodyLifecycle.getAll({});
            return data || [];
        } catch (err) {
            console.error('Error exporting products:', err);
            throw err;
        }
    }, []);

    /**
     * Cargar datos al montar el hook
     */
    useEffect(() => {
        loadProducts();
        loadStatistics();
    }, [loadProducts, loadStatistics]);

    // Filtrar productos según los filtros aplicados
    const filteredProducts = products.filter(product => {
        if (searchTerm && !product.inventory_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !product.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (!product.serial_number || !product.serial_number.toLowerCase().includes(searchTerm.toLowerCase()))) {
            return false;
        }
        return true;
    });

    return {
        // Estado
        products: filteredProducts,
        allProducts: products,
        loading,
        error,
        statistics,
        searchTerm,
        statusFilter,
        reasonFilter,

        // Setters
        setSearchTerm,
        setStatusFilter,
        setReasonFilter,

        // Métodos
        loadProducts,
        loadStatistics,
        createProduct,
        updateProduct,
        changeProductStatus,
        getProductHistory,
        searchProducts,
        filterByStatus,
        filterByReason,
        exportProducts,
    };
};
