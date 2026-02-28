import React, { useState } from 'react';
import { useCustodyProducts } from './hooks/useCustodyProducts';
import { ProductForm } from './components/ProductForm';
import { CustodyProductTable } from './components/CustodyProductTable';
import { ProductHistory } from './components/ProductHistory';
import { StateChangeModal } from './components/StateChangeModal';

/**
 * Vista principal del módulo de Bienes en Custodia (CEDES)
 */
export default function ProductsView() {
  const {
    products,
    loading,
    error,
    statistics,
    createProduct,
    updateProduct,
    changeProductStatus,
    searchProducts,
    filterByStatus,
  } = useCustodyProducts();

  // Estados del modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de notificación
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Filtros
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilterLocal] = useState('');

  const showNotification = (message, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleOpenForm = (product = null) => {
    setSelectedProduct(product);
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
    setSelectedProduct(null);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      let result;
      if (selectedProduct) {
        result = await updateProduct(selectedProduct.id, formData);
      } else {
        result = await createProduct(formData);
      }

      if (result.success) {
        showNotification(
          selectedProduct ? 'Producto actualizado exitosamente' : 'Producto registrado exitosamente'
        );
        handleCloseForm();
      } else {
        showNotification(result.error || 'Error al guardar el producto', 'error');
      }
    } catch (err) {
      showNotification('Error al guardar el producto', 'error');
      console.error('Error submitting form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenHistory = (product) => {
    setSelectedProduct(product);
    setShowHistoryModal(true);
  };

  const handleOpenStatusChange = (product) => {
    setSelectedProduct(product);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (changeData) => {
    setIsSubmitting(true);
    try {
      const result = await changeProductStatus(
        selectedProduct.id,
        changeData.newStatus,
        changeData.reasonChange,
        changeData.changedBy,
        changeData.receptionData
      );

      if (result.success) {
        showNotification('Estado del producto actualizado exitosamente');
        setShowStatusModal(false);
        setSelectedProduct(null);
      } else {
        showNotification(result.error || 'Error al cambiar el estado', 'error');
      }
    } catch (err) {
      showNotification('Error al cambiar el estado', 'error');
      console.error('Error changing status:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim()) {
      await searchProducts(value);
    } else {
      setStatusFilterLocal('');
      setReasonFilterLocal('');
      await searchProducts(''); // Recargar todos los productos
    }
  };

  const handleStatusFilterChange = async (e) => {
    const value = e.target.value;
    setStatusFilterLocal(value);
    if (value) {
      await filterByStatus(value);
    } else {
      setSearchInput('');
      await searchProducts(''); // Recargar todos los productos
    }
  };



  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Sistema de Bienes en Custodia
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Gestión de bienes bajo resguardo en el CEDES (Centro de Distribución y Resguardo)
          </p>
        </div>

        {/* Notificaciones */}
        {successMessage && (
          <div className="p-4 mb-4 border-l-4 border-green-500 rounded-r-lg bg-green-50 dark:bg-green-900/20 dark:border-green-800 animate-fadeIn">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="font-medium text-green-700 dark:text-green-300">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 mb-4 border-l-4 border-red-500 rounded-r-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800 animate-fadeIn">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 mb-4 border-l-4 border-red-500 rounded-r-lg bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <p className="font-medium text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Estadísticas */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Productos</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {statistics.totalProducts}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">En Tránsito</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {statistics.byStatus?.find(s => s.product_status === 'EN_TRANSITO')?.count || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">En Resguardo</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {statistics.byStatus?.find(s => s.product_status === 'EN_RESGUARDO')?.count || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Cantidad Total</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                {statistics.totalQuantity}
              </p>
            </div>
          </div>
        )}

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Buscar
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={handleSearch}
                placeholder="N° Inventario, Descripción, Serie..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Todos --</option>
                <option value="EN_TRANSITO">En Tránsito</option>
                <option value="EN_RESGUARDO">En Resguardo</option>
              </select>
            </div>

            {/* Botón Nuevo Bien */}
            <div className="flex items-end">
              <button
                onClick={() => handleOpenForm()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                + Nuevo Bien
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de productos */}
        <CustodyProductTable
          products={products}
          loading={loading}
          onEdit={handleOpenForm}
          onChangeStatus={handleOpenStatusChange}
          onViewHistory={handleOpenHistory}
        />
      </div>

      {/* Modal Formulario */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedProduct ? 'Editar Bien' : 'Nuevo Bien en Custodia'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <ProductForm
                product={selectedProduct}
                onSubmit={handleFormSubmit}
                onCancel={handleCloseForm}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {showHistoryModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <ProductHistory
                product={selectedProduct}
                onClose={() => {
                  setShowHistoryModal(false);
                  setSelectedProduct(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Cambio de Estado */}
      {showStatusModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cambiar Estado del Producto
                </h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <StateChangeModal
                product={selectedProduct}
                onSubmit={handleStatusChange}
                onCancel={() => {
                  setShowStatusModal(false);
                  setSelectedProduct(null);
                }}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
