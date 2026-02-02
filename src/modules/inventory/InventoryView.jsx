import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Toast } from '../../components/Toast';

/**
 * Vista principal: Módulo de Registro y Custodia de Bienes
 * Sistema de Gestión de Ciclo de Vida Completo
 * 
 * NO maneja ventas ni stock comercial.
 * Registra todo el ciclo de vida del bien con historial inmutable.
 * Estados: EN_TRANSITO → EN_RESGUARDO → BAJA_DEFINITIVA
 */
export default function InventoryView() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reasonFilter, setReasonFilter] = useState('');
  const [statistics, setStatistics] = useState({
    total: 0,
    enTransito: 0,
    enResguardo: 0,
    bajaDefinitiva: 0,
    porMotivo: { BAJA: 0, RESGUARDO: 0, TRASLADO: 0 }
  });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        status: statusFilter || undefined,
        reason: reasonFilter || undefined,
        search: searchTerm || undefined
      };
      const data = await window.api.custodyLifecycle.getAll(filters);
      setProducts(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStatistics = async () => {
    try {
      const stats = await window.api.custodyLifecycle.getStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadStatistics();
  }, [statusFilter, reasonFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const getStatusBadge = (status) => {
    const badges = {
      'EN_TRANSITO': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'EN_RESGUARDO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'BAJA_DEFINITIVA': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getReasonBadge = (reason) => {
    const badges = {
      'BAJA': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'RESGUARDO': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'TRASLADO': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return badges[reason] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📦 Registro y Resguardo de Productos
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestión del ciclo de vida completo • Historial inmutable • Sin eliminación física
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 mb-6 border-l-4 border-red-500 rounded-r-lg bg-red-50 dark:bg-red-900/20">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2 lg:grid-cols-5">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Productos</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{statistics.total}</p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">En Tránsito</p>
            <p className="text-3xl font-bold text-orange-600">{statistics.enTransito}</p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">En Resguardo</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.enResguardo}</p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Baja Definitiva</p>
            <p className="text-3xl font-bold text-gray-600">{statistics.bajaDefinitiva}</p>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-600 dark:text-gray-400">Por Motivo</p>
            <div className="mt-1 space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Resguardo:</span>
                <span className="font-semibold">{statistics.porMotivo.RESGUARDO}</span>
              </div>
              <div className="flex justify-between">
                <span>Baja:</span>
                <span className="font-semibold">{statistics.porMotivo.BAJA}</span>
              </div>
              <div className="flex justify-between">
                <span>Traslado:</span>
                <span className="font-semibold">{statistics.porMotivo.TRASLADO}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda y Filtros */}
        <div className="p-4 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Buscar
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="N° inventario, descripción, serie..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="EN_TRANSITO">En Tránsito</option>
                <option value="EN_RESGUARDO">En Resguardo</option>
                <option value="BAJA_DEFINITIVA">Baja Definitiva</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Motivo
              </label>
              <select
                value={reasonFilter}
                onChange={(e) => setReasonFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos los motivos</option>
                <option value="RESGUARDO">Resguardo</option>
                <option value="BAJA">Baja</option>
                <option value="TRASLADO">Traslado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Productos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                No hay bienes registrados
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Los bienes aparecerán aquí cuando sean registrados
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">N° Inventario</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Descripción</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Marca/Modelo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Motivo</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Centro Origen</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900 dark:text-white">
                        {product.inventory_number}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        <div>
                          <p className="font-medium">{product.description}</p>
                          {product.serial_number && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                              S/N: {product.serial_number}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {product.brand || '-'} {product.model || ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.product_status)}`}>
                          {product.product_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReasonBadge(product.reason)}`}>
                          {product.reason}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {product.center_origin || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                        {new Date(product.created_at).toLocaleDateString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            ℹ️ Acerca del Módulo de Registro y Resguardo
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>• <strong>Ciclo de Vida:</strong> EN_TRANSITO → EN_RESGUARDO → BAJA_DEFINITIVA</li>
            <li>• <strong>Historial Inmutable:</strong> Todos los eventos quedan registrados permanentemente</li>
            <li>• <strong>Sin Eliminación Física:</strong> Los productos nunca se borran, solo se dan de baja</li>
            <li>• <strong>Trazabilidad Completa:</strong> Entrega, recepción chofer, recepción almacén, cambios de estado</li>
          </ul>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}
