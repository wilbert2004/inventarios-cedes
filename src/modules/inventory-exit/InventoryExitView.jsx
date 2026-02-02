import { useRef, useState, useCallback } from 'react';
import { ExitForm } from './components/ExitForm';
import { ExitProductSearch } from './components/ExitProductSearch';
import { ExitCart } from './components/ExitCart';
import { ExitSummaryPanel } from './components/ExitSummaryPanel';
import { useSalesExit } from './hooks/useSalesExit';
import { Toast } from '../../components/Toast';

/**
 * Vista principal para gestión de salidas de bienes
 * Permite registrar extracciones de bienes del inventario
 */
export function InventoryExitView() {
    const formRef = useRef(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        folio: '',
        reason: '',
        exit_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Usar hook de salidas
    const {
        products,
        exitCart,
        totals,
        searchProduct,
        addToExitCart,
        updateQuantity,
        removeFromCart,
        processExit,
        clearCart,
    } = useSalesExit();

    /**
     * Mostrar mensaje toast
     */
    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 4000);
    };

    /**
     * Manejar selección de producto en búsqueda
     */
    const handleProductSelect = useCallback(
        async (product) => {
            // Validar que el producto tenga stock
            if (!product.stock || product.stock === 0) {
                showToast('Este producto no tiene stock disponible', 'error');
                return;
            }

            // Validar que no esté duplicado en el carrito
            const alreadyInCart = exitCart.some((item) => item.id === product.id);
            if (alreadyInCart) {
                showToast('Este bien ya está en el carrito', 'warning');
                return;
            }

            // Agregar al carrito
            addToExitCart(product, 1);
            showToast(`${product.name} agregado al carrito`, 'success');
        },
        [exitCart, addToExitCart]
    );

    /**
     * Manejar procesamiento de salida
     */
    const handleProcessExit = useCallback(
        async (deliveryData) => {
            // Validar formulario
            if (!formRef.current || !formRef.current.validate()) {
                showToast('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            // Validar carrito
            if (exitCart.length === 0) {
                showToast('Debe haber al menos un bien en el carrito', 'error');
                return;
            }

            try {
                setIsProcessing(true);

                // Obtener datos del formulario
                const exitData = formRef.current.getData();

                // Preparar payload
                const payload = {
                    ...exitData,
                    ...deliveryData,
                    items: exitCart.map((item) => ({
                        productId: item.id,
                        quantity: item.quantity,
                    })),
                };

                // Procesar la salida
                const result = await processExit(payload);

                if (result.success) {
                    showToast(
                        `Salida registrada correctamente. Folio: ${result.folio}`,
                        'success'
                    );

                    // Limpiar formulario
                    setFormData({
                        folio: '',
                        reason: '',
                        exit_date: new Date().toISOString().split('T')[0],
                        description: '',
                    });

                    if (formRef.current) {
                        // Reset form
                        Object.assign(formRef.current.getData(), {
                            folio: '',
                            reason: '',
                            exit_date: new Date().toISOString().split('T')[0],
                            description: '',
                        });
                    }

                    // Limpiar carrito
                    clearCart();

                    // Recargar productos
                    setTimeout(() => {
                        // El hook debería recargar automáticamente
                    }, 500);
                } else {
                    showToast(
                        result.message || 'Error al procesar la salida',
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error procesando salida:', error);
                showToast(
                    error.message || 'Error al procesar la salida',
                    'error'
                );
            } finally {
                setIsProcessing(false);
            }
        },
        [exitCart, processExit, clearCart, formRef]
    );

    /**
     * Manejar cancelación
     */
    const handleCancel = () => {
        if (exitCart.length > 0) {
            const confirmed = window.confirm(
                '¿Estás seguro de que deseas cancelar? Se perderá todo lo que hayas agregado.'
            );
            if (!confirmed) return;
        }

        clearCart();
        setFormData({
            folio: '',
            reason: '',
            exit_date: new Date().toISOString().split('T')[0],
            description: '',
        });
        showToast('Operación cancelada', 'info');
    };

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="max-w-6xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Salida de Bienes
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Registra extracciones y salidas de bienes del inventario
                    </p>
                </div>

                {/* Toast */}
                {toastMessage && (
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setToastMessage(null)}
                    />
                )}

                {/* Layout en dos columnas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Columna izquierda: Formulario y búsqueda */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Formulario */}
                        <ExitForm
                            ref={formRef}
                            initialData={formData}
                            onDataChange={setFormData}
                        />

                        {/* Búsqueda de productos */}
                        <ExitProductSearch
                            products={products}
                            onSelectProduct={handleProductSelect}
                            isLoading={products.length === 0}
                        />

                        {/* Carrito */}
                        <ExitCart
                            items={exitCart}
                            products={products}
                            onUpdateQuantity={updateQuantity}
                            onRemoveItem={removeFromCart}
                            isProcessing={isProcessing}
                        />
                    </div>

                    {/* Columna derecha: Resumen */}
                    <div>
                        <ExitSummaryPanel
                            totals={totals}
                            formData={formData}
                            cartItemsCount={exitCart.length}
                            onProcess={handleProcessExit}
                            onCancel={handleCancel}
                            isProcessing={isProcessing}
                        />
                    </div>
                </div>

                {/* Información de ayuda */}
                <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300">
                        💡 Consejos para usar esta sección
                    </h3>
                    <ul className="mt-2 ml-4 text-sm text-blue-800 dark:text-blue-400 list-disc space-y-1">
                        <li>Busca bienes por código de barras o nombre</li>
                        <li>Especifica el motivo de la salida (traslado, devolución, etc.)</li>
                        <li>El folio debe ser único para cada salida</li>
                        <li>No puedes extraer más cantidad de la que hay disponible</li>
                        <li>Completa los datos de entrega y recepción antes de procesar</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
