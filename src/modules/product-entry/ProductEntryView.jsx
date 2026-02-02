import * as React from 'react';
import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProductEntry } from './hooks/useProductEntry';
import { ProductModal } from '../products/components/ProductModal';
import { ProductSearchBar } from './components/ProductSearchBar';
import { EntryForm } from './components/EntryForm';
import { EntryCart } from './components/EntryCart';
import { SummaryPanel } from './components/SummaryPanel';
import { Toast } from '../../components/Toast';

/**
 * Vista principal de entrada de bienes (recepción de mercancía)
 */
export default function ProductEntryView() {
  const { user } = useAuth();
  const {
    entryCart,
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
    refreshProducts,
  } = useProductEntry();

  const entryFormRef = useRef(null);
  const [entryFormData, setEntryFormData] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [entryResult, setEntryResult] = useState(null);
  const [pendingProductSearch, setPendingProductSearch] = useState({ term: '', quantity: 1 });
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [toast, setToast] = useState(null);

  /**
   * Manejar producto encontrado
   */
  const handleProductFound = (searchTerm, quantity) => {
    const product = searchProduct(searchTerm);

    if (product) {
      try {
        addToEntryCart(product, quantity);
      } catch (err) {
        // Mostrar error si es producto PRECIO_LIBRE
        setToast({
          variant: 'error',
          title: 'Error',
          message: err.message || 'Error al agregar producto al carrito',
        });
      }
    } else {
      // Producto no existe, guardar datos y abrir modal de creación
      setPendingProductSearch({ term: searchTerm, quantity });
      setShowCreateProductModal(true);
    }
  };

  /**
   * Manejar creación de producto desde entrada
   */
  const handleCreateProduct = async (productData) => {
    setIsCreatingProduct(true);

    try {
      const result = await createProduct(productData);

      if (result.success && result.product) {
        // Recargar productos para actualizar la lista
        await refreshProducts();

        // Usar el producto devuelto directamente (ya tiene el ID y todos los datos)
        const productToAdd = {
          id: result.product.id,
          barcode: result.product.barcode,
          name: result.product.name,
          description: result.product.description,
          sale_price: result.product.sale_price,
          purchase_cost: result.product.purchase_cost,
          stock: result.product.stock,
          active: result.product.active,
        };

        // Agregar al carrito con la cantidad pendiente
        addToEntryCart(productToAdd, pendingProductSearch.quantity);

        // Cerrar modal
        setShowCreateProductModal(false);
        setPendingProductSearch({ term: '', quantity: 1 });

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsCreatingProduct(false);
    }
  };

  /**
   * Procesar entrada
   */
  const handleProcessEntry = async () => {
    if (entryCart.length === 0) {
      setToast({
        variant: 'error',
        title: 'Error',
        message: 'Debe ingresar al menos un producto',
      });
      return;
    }

    // Validar formulario de entrada
    if (!entryFormRef.current || !entryFormRef.current.validate()) {
      setToast({
        variant: 'error',
        title: 'Datos incompletos',
        message: 'Por favor complete todos los campos requeridos',
      });
      return;
    }

    const result = await processEntry(user?.id || 1, entryFormData);

    if (result.success) {
      setEntryResult(result.entry);
      setShowSuccessModal(true);
    } else {
      setToast({
        variant: 'error',
        title: 'Error',
        message: result.error || 'Error al procesar entrada',
      });
    }
  };

  /**
   * Cancelar entrada
   */
  const handleCancel = () => {
    if (entryCart.length > 0 && window.confirm('¿Cancelar la entrada de bienes?')) {
      clearCart();
    }
  };

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrada de Bienes</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Registra la recepción de bienes y actualiza el inventario
          </p>
        </div>

        {/* Mensaje de error general */}
        {error && (
          <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg dark:border-red-800 bg-red-50 dark:bg-red-900/20 animate-fadeIn">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-3 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="font-medium text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Panel izquierdo - Datos y productos */}
          <div className="space-y-4 lg:col-span-2">
            {/* Formulario de entrada */}
            <EntryForm
              ref={entryFormRef}
              onDataChange={setEntryFormData}
            />

            {/* Barra de búsqueda */}
            <ProductSearchBar onProductFound={handleProductFound} />

            {/* Carrito de entrada */}
            <EntryCart
              items={entryCart}
              onUpdateQuantity={updateQuantity}
              onUpdateCondition={updateCondition}
              onRemove={removeFromCart}
            />
          </div>

          {/* Panel derecho - Resumen */}
          <div>
            <SummaryPanel
              totals={totals}
              onProcess={handleProcessEntry}
              onCancel={handleCancel}
              processing={processing}
              disabled={entryCart.length === 0}
            />
          </div>
        </div>
      </div>

      {/* Modal de creación de producto */}
      <ProductModal
        isOpen={showCreateProductModal}
        onClose={() => {
          setShowCreateProductModal(false);
          setPendingProductSearch({ term: '', quantity: 1 });
        }}
        onSubmit={handleCreateProduct}
        loading={isCreatingProduct}
        product={{ barcode: pendingProductSearch.term }}
      />

      {/* Toast de notificación */}
      {toast && (
        <Toast
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Modal de entrada exitosa */}
      {showSuccessModal && entryResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/30">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h3 className="mb-2 text-2xl font-bold text-center text-gray-900 dark:text-white">
              ¡Entrada registrada!
            </h3>

            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
              El stock se actualizó correctamente
            </p>

            <div className="p-4 mb-6 space-y-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Productos ingresados:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {entryResult.totalItems}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Cantidad total:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {entryResult.totalQuantity}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Registrado el:</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(entryResult.timestamp).toLocaleString('es-MX')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            >
              Nueva Entrada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

