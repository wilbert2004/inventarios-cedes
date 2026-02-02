import * as React from 'react';
import { useSales } from './hooks/useSales';

export default function SalesView() {
  const {
    cart,
    searchTerm,
    setSearchTerm,
    paymentAmount,
    setPaymentAmount,
    loading,
    processing,
    showErrorModal,
    errorMessage,
    showSuccessToast,
    successMessage,
    searchInputRef,
    total,
    payment,
    change,
    handleSearch,
    updateQuantity,
    removeFromCart,
    processSale,
    cancelSale,
    closeErrorModal,
    closeSuccessToast,
    showWeightModal,
    showPriceModal,
    weightInput,
    setWeightInput,
    priceInput,
    setPriceInput,
    pendingProduct,
    confirmWeight,
    confirmPrice,
    closeWeightModal,
    closePriceModal,
    editWeight,
    editPrice,
  } = useSales();

  /**
   * Manejar envío del formulario de búsqueda
   */
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };

  return (
    <div className="w-full min-h-screen p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Punto de Venta</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Escanea o busca productos para agregar a la venta</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Panel izquierdo - Búsqueda y productos */}
          <div className="space-y-4 lg:col-span-2">
            {/* Barra de búsqueda */}
            <form onSubmit={handleSearchSubmit} className="p-4 bg-white rounded-lg shadow-sm dark:bg-gray-800">
              <div className="flex gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escanea código de barras o busca por nombre..."
                  className="flex-1 px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Agregar
                </button>
              </div>
            </form>

            {/* Lista de productos en el carrito */}
            <div className="overflow-hidden bg-white rounded-lg shadow-sm dark:bg-gray-800">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Productos ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p>No hay productos en el carrito</p>
                    <p className="mt-1 text-sm">Escanea o busca productos para comenzar</p>
                  </div>
                ) : (
                  cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.tipo_venta === 'PESO' 
                              ? `$${item.price.toFixed(2)}/kg` 
                              : item.tipo_venta === 'PRECIO_LIBRE'
                              ? `Precio variable`
                              : `$${item.price.toFixed(2)} c/u`}
                          </p>
                          {item.tipo_venta === 'PESO' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.quantity.toFixed(2)} kg
                            </p>
                          )}
                          {item.tipo_venta === 'PRECIO_LIBRE' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ${item.price.toFixed(2)}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Control de cantidad - solo para UNIDAD */}
                          {item.tipo_venta === 'UNIDAD' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="flex items-center justify-center w-8 h-8 font-bold text-gray-700 bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                -
                              </button>
                              <span className="w-12 font-medium text-center text-gray-900 dark:text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="flex items-center justify-center w-8 h-8 font-bold text-gray-700 bg-gray-200 rounded-md dark:text-gray-300 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                +
                              </button>
                            </div>
                          )}

                          {/* Botón editar para PESO y PRECIO_LIBRE */}
                          {item.tipo_venta === 'PESO' && (
                            <button
                              onClick={() => editWeight(item, index)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              title="Editar peso"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {item.tipo_venta === 'PRECIO_LIBRE' && (
                            <button
                              onClick={() => editPrice(item, index)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                              title="Editar precio"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          )}

                          {/* Subtotal */}
                          <div className="w-24 font-semibold text-right text-gray-900 dark:text-white">
                            ${item.tipo_venta === 'PRECIO_LIBRE' 
                              ? item.price.toFixed(2)
                              : (item.price * item.quantity).toFixed(2)}
                          </div>

                          {/* Botón eliminar */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Panel derecho - Resumen y pago */}
          <div className="space-y-4">
            {/* Resumen de la venta */}
            <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Resumen</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">Total a pagar:</span>
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">${total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-right text-gray-500 dark:text-gray-400">IVA incluido</p>
              </div>
            </div>

            {/* Panel de pago */}
            {cart.length > 0 && (
              <div className="p-6 bg-white rounded-lg shadow-sm dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Pago</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Monto recibido
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 text-lg text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {paymentAmount && payment >= total && (
                    <div className="p-4 border border-green-200 rounded-lg dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-700 dark:text-green-400">Cambio:</span>
                        <span className="text-2xl font-bold text-green-700 dark:text-green-400">${change.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {paymentAmount && payment < total && (
                    <div className="p-4 border border-red-200 rounded-lg dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400">
                        Falta: ${(total - payment).toFixed(2)}
                      </p>
                    </div>
                  )}

                  {/* Botones de acceso rápido para pagos comunes */}
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 20, 50, 100, 200, 500].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setPaymentAmount(amount.toString())}
                        className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-md dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="space-y-2">
              <button
                onClick={processSale}
                disabled={cart.length === 0 || payment < total || processing}
                className="flex items-center justify-center w-full gap-2 py-4 text-lg font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  `Cobrar $${total.toFixed(2)}`
                )}
              </button>
              
              <button
                onClick={cancelSale}
                disabled={cart.length === 0}
                className="w-full py-3 font-medium text-red-600 transition-colors bg-white border-2 border-red-600 rounded-lg hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Cancelar venta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de producto no encontrado */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            
            <h3 className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
              Producto no encontrado
            </h3>
            
            <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
              {errorMessage}
            </p>
            
            <button
              onClick={closeErrorModal}
              className="w-full py-3 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Toast de éxito */}
      {showSuccessToast && (
        <div className="fixed z-50 top-4 right-4 animate-slideInRight">
          <div className="flex items-center gap-3 p-4 bg-green-500 text-white rounded-lg shadow-lg min-w-[300px] max-w-md">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold">¡Venta completada!</p>
              <p className="text-sm text-green-50">{successMessage}</p>
            </div>
            <button
              onClick={closeSuccessToast}
              className="flex-shrink-0 text-white transition-colors hover:text-green-100"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal para ingresar peso (productos PESO) */}
      {showWeightModal && pendingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            
            <h3 className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
              {pendingProduct.cartItemIndex !== undefined ? 'Editar Peso' : 'Ingresar Peso'}
            </h3>
            
            <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
              {pendingProduct.name}
            </p>
            
            <p className="mb-2 text-sm text-center text-gray-500 dark:text-gray-400">
              Precio: ${pendingProduct.sale_price?.toFixed(2) || '0.00'} por kg
            </p>
            
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Peso en kilogramos
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    confirmWeight();
                  }
                }}
                autoFocus
                className="w-full px-4 py-3 text-lg text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              {weightInput && parseFloat(weightInput) > 0 && (
                <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-300">
                  Total: ${(parseFloat(weightInput) * (pendingProduct.sale_price || 0)).toFixed(2)}
                </p>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closeWeightModal}
                className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmWeight}
                className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ingresar precio (productos PRECIO_LIBRE) */}
      {showPriceModal && pendingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl dark:bg-gray-800 animate-fadeIn">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full dark:bg-purple-900/30">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="mb-2 text-xl font-bold text-center text-gray-900 dark:text-white">
              {pendingProduct.cartItemIndex !== undefined ? 'Editar Precio' : 'Ingresar Monto'}
            </h3>
            
            <p className="mb-4 text-center text-gray-600 dark:text-gray-300">
              {pendingProduct.name}
            </p>
            
            <p className="mb-2 text-sm text-center text-yellow-600 dark:text-yellow-400">
              ⚠️ Producto de precio variable
            </p>
            
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Monto total
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500 dark:text-gray-400">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      confirmPrice();
                    }
                  }}
                  autoFocus
                  className="w-full py-3 pl-8 pr-4 text-lg text-gray-900 bg-white border border-gray-300 rounded-lg outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={closePriceModal}
                className="flex-1 px-4 py-3 font-medium text-gray-700 transition-colors bg-white border-2 border-gray-300 rounded-lg dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPrice}
                className="flex-1 px-4 py-3 font-medium text-white transition-colors bg-purple-600 rounded-lg hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}