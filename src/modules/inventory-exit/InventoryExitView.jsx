import { useRef, useState, useCallback } from 'react';
import { CustodyExitForm } from './components/CustodyExitForm';
import { CustodyProductSearch } from './components/CustodyProductSearch';
import { CustodyExitCart } from './components/CustodyExitCart';
import { CustodyExitSummary } from './components/CustodyExitSummary';
import { useCustodyExit } from './hooks/useCustodyExit';
import { Toast } from '../../components/Toast';

/**
 * Vista principal para gestión de salidas de bienes en resguardo
 * Permite registrar salidas definitivas hacia Zona Principal
 */
export function InventoryExitView() {
    const formRef = useRef(null);
    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        folio: '',
        exit_date: new Date().toISOString().split('T')[0],
        description: '',
    });

    // Usar hook de salidas de resguardo
    const {
        custodyProducts,
        exitCart,
        totals,
        loading,
        addToExitCart,
        removeFromCart,
        processExit,
        clearCart,
    } = useCustodyExit();

    /**
     * Mostrar mensaje toast
     */
    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 4000);
    };

    /**
     * Manejar selección de bien en búsqueda
     */
    const handleProductSelect = useCallback(
        async (product) => {
            try {
                // Agregar al carrito (validaciones en el hook)
                addToExitCart(product);
                showToast(`${product.inventory_number} agregado al carrito`, 'success');
            } catch (error) {
                showToast(error.message || 'Error al agregar bien', 'error');
            }
        },
        [addToExitCart]
    );

    /**
     * Manejar procesamiento de salida de resguardo
     */
    const handleProcessExit = useCallback(
        async (responsiblesData) => {
            // Validar formulario
            if (!formRef.current || !formRef.current.validate()) {
                showToast('Por favor completa todos los campos requeridos del documento', 'error');
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

                // Procesar salida con todos los datos
                const result = await processExit({
                    ...exitData,
                    ...responsiblesData,
                });

                if (result.success) {
                    showToast(`✅ Salida procesada exitosamente. Folio: ${result.folio}`, 'success');

                    // Limpiar carrito y formulario completamente
                    clearCart();
                    setFormData({
                        folio: '',
                        exit_date: new Date().toISOString().split('T')[0],
                        description: '',
                    });
                } else {
                    showToast(result.message || 'Error al procesar salida', 'error');
                }
            } catch (err) {
                const errorMessage = err.message || 'Error al procesar salida';
                showToast(errorMessage, 'error');
                console.error('Error processing custody exit:', err);
            } finally {
                setIsProcessing(false);
            }
        },
        [exitCart, processExit]
    );

    /**
     * Cancelar operación
     */
    const handleCancel = useCallback(() => {
        if (exitCart.length > 0) {
            const confirmed = window.confirm(
                '¿Deseas cancelar? Se perderán los bienes del carrito.'
            );
            if (!confirmed) return;
            clearCart();
        }
        showToast('Operación cancelada', 'success');
    }, [exitCart, clearCart]);

    return (
        <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Encabezado */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                        Salida de Bienes en Resguardo
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Registra salida definitiva de bienes hacia <strong>Zona Principal</strong>
                    </p>
                </div>

                {/* Toast */}
                {toastMessage && (
                    <Toast
                        message={toastMessage}
                        variant={toastType}
                        onClose={() => setToastMessage(null)}
                    />
                )}

                {/* Layout en dos columnas */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Columna izquierda: Formulario y búsqueda */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Formulario de documento */}
                        <CustodyExitForm
                            ref={formRef}
                            initialData={formData}
                            onDataChange={setFormData}
                        />

                        {/* Búsqueda de bienes en resguardo */}
                        <CustodyProductSearch
                            products={custodyProducts}
                            onSelectProduct={handleProductSelect}
                            isLoading={loading}
                        />

                        {/* Carrito de bienes */}
                        <CustodyExitCart
                            items={exitCart}
                            onRemoveItem={removeFromCart}
                        />
                    </div>

                    {/* Columna derecha: Resumen y responsables */}
                    <div className="lg:col-span-1">
                        <CustodyExitSummary
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
                <div className="mt-8 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">
                                💡 Información Importante
                            </h3>
                            <ul className="text-sm text-amber-800 dark:text-amber-400 list-disc list-inside space-y-1">
                                <li>Solo se muestran bienes con estado <strong>EN RESGUARDO</strong></li>
                                <li>La salida es <strong>definitiva</strong> - El bien no regresa al área original</li>
                                <li>El destino siempre es <strong>Zona Principal</strong></li>
                                <li>Se requiere información de los 3 responsables (Entrega, Transporta, Recibe)</li>
                                <li>El folio puede ser <strong>automático</strong> (SAL-RSG-AÑO-###, consecutivo) o <strong>manual</strong> (debe ser único)</li>
                                <li>Todos los bienes de una misma salida comparten el mismo folio</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

