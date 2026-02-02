import React, { useEffect, useState } from 'react';
import { useReports } from './hooks/useReports';
import { ReportSelector } from './components/ReportSelector';
import { ReportFilters } from './components/ReportFilters';
import { ReportChart } from './components/ReportChart';
import { ReportPreview } from './components/ReportPreview';
import { REPORT_DATE_RANGES, REPORT_TYPES } from './types/reportTypes';
import { SaleSearchBar } from './components/SaleSearchBar';
import { Toast } from '../../components/Toast';

/**
 * Vista principal de reportes
 * Orquesta todos los componentes y maneja el flujo de datos
 */
export default function ReportsView() {
    // ============ ESTADOS ============
    // Datos del gráfico (vienen del hook)
    const [chartData, setChartData] = useState([]);
    // Para venta específica (personalizado)
    const [customSale, setCustomSale] = useState(null);
    // Toast: { variant: 'success'|'error', title?: string, message: string }
    const [toast, setToast] = useState(null);

    // ============ USAR HOOK ============
    const {
        currentReportType,
        reportData,
        customDateRange,
        loading,
        error,
        getReport,
        setCurrentReportType,
        setCustomDateRange,
    } = useReports();

    // ============ EFECTOS ============

    /**
     * Cuando el usuario cambia el tipo de reporte
     * Cargar los datos automáticamente
     */
    useEffect(() => {
        if (currentReportType) {
            loadReportData(currentReportType);
        }
    }, [currentReportType]);

    // ============ FUNCIONES ============

    /**
     * Procesa las ventas en formato que el gráfico puede usar
     * Por ejemplo: Agrupa por día para reportes semanales
     */
    /**
 * Cuando se encuentra una venta específica
 * Prepara los datos para mostrar
 */
    const handleCustomSaleFound = async (sale) => {
        try {
            // Transformar datos de venta específica a formato de reporte
            const customReport = {
                type: REPORT_TYPES.CUSTOM,
                dateRange: {
                    start: new Date(sale.created_at),
                    end: new Date(sale.created_at),
                },
                summary: {
                    totalSales: sale.total,
                    transactionCount: 1,
                    averageTransaction: sale.total,
                },
                sales: [sale],
                saleDetails: sale.items, // Para mostrar productos
                generatedAt: new Date(),
            };

            setCustomSale(customReport);
            setChartData([]);
        } catch (err) {
            console.error('Error procesando venta:', err);
            setToast({ variant: 'error', message: 'Error al procesar la venta' });
        }
    };

    const processDataForChart = (sales, reportType) => {
        if (!sales || sales.length === 0) return [];

        // Agrupar por fecha
        const groupedByDate = {};

        sales.forEach((sale) => {
            // Extraer solo la fecha (sin hora)
            const dateStr = sale.created_at.split(' ')[0]; // "2026-01-05 12:30:45" → "2026-01-05"

            if (!groupedByDate[dateStr]) {
                groupedByDate[dateStr] = {
                    date: dateStr,
                    transaction_count: 0,
                    total_sales: 0,
                    average_transaction: 0,
                };
            }

            groupedByDate[dateStr].transaction_count += 1;
            groupedByDate[dateStr].total_sales += sale.total;
        });

        // Convertir objeto a array
        const chartArray = Object.values(groupedByDate);

        // Calcular promedio
        chartArray.forEach((item) => {
            item.average_transaction =
                item.total_sales / item.transaction_count;
        });

        return chartArray;
    };

    /**
     * Cargar datos del reporte
     * Usa el tipo actual y fechas personalizadas (si existen)
     */
    const loadReportData = async (reportType, dateRange = null) => {
        const report = await getReport(reportType, dateRange);

        if (report && report.sales) {
            // Procesar datos para el gráfico
            const processedData = processDataForChart(report.sales, reportType);
            setChartData(processedData);
        }
    };

    /**
     * Cuando el usuario cambia las fechas manualmente
     * Recargar los datos con las nuevas fechas
     */
    const handleDateFilterChange = (newDateRange) => {
        setCustomDateRange(newDateRange);
        loadReportData(currentReportType, newDateRange);
    };

    /**
     * Cuando el usuario clica "Descargar PDF"
     * Genera el PDF y permite que el usuario lo guarde
     */
    const handleDownloadPDF = async (report) => {
        try {
            if (!report) {
                setToast({ variant: 'error', message: 'No hay datos de reporte para descargar' });
                return;
            }

            const filePath = await window.api.reports.generatePDF(
                report,
                currentReportType
            );

            // Solo mostrar toast de éxito si el archivo fue guardado (filePath no es null/undefined)
            if (filePath) {
                setToast({
                    variant: 'success',
                    title: 'PDF guardado',
                    message: filePath,
                });
            }
        } catch (err) {
            console.error('Error descargando PDF:', err);
            setToast({ variant: 'error', message: 'Error al generar el PDF: ' + err.message });
        }
    };

    // ============ RENDER ============
    return (
        <div className="w-full min-h-screen p-4 bg-gray-100 md:p-6 dark:bg-gray-900">
            <div className="w-full max-w-[1440px] mx-auto">
                {/* Encabezado */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reportes de Ventas</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Analiza el desempeño de tus ventas en diferentes períodos
                    </p>
                </div>

                {/* Mostrar errores */}
                {error && (
                    <div className="p-4 mb-6 text-red-700 bg-red-100 border border-red-400 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
                        Error: {error}
                    </div>
                )}

                {/* SELECTOR DE TIPO DE REPORTE */}
                <ReportSelector
                    currentType={currentReportType}
                    onSelect={setCurrentReportType}
                />

                {/* SI ES VENTA ESPECÍFICA: MOSTRAR BUSCADOR */}
                {currentReportType === REPORT_TYPES.CUSTOM ? (
                    <SaleSearchBar
                        onSaleFound={handleCustomSaleFound}
                        loading={loading}
                    />
                ) : (
                    <>
                        {/* FILTROS DE FECHA - Solo para reportes de período */}
                        <ReportFilters
                            dateRange={
                                customDateRange && customDateRange.start && customDateRange.end
                                    ? customDateRange
                                    : {
                                        start: new Date(Date.now() - REPORT_DATE_RANGES[currentReportType] * 24 * 60 * 60 * 1000),
                                        end: new Date(),
                                    }
                            }
                            onDateChange={handleDateFilterChange}
                        />
                    </>
                )}

                {/* CONTENEDOR PRINCIPAL: GRÁFICO + RESUMEN */}
                {currentReportType === REPORT_TYPES.CUSTOM && customSale ? (
                    // Mostrar detalles de venta específica
                    <div className="grid grid-cols-1 gap-4 mb-6 md:gap-6 lg:grid-cols-4">
                        {/* Detalles de venta (ocupa 3/4) */}
                        <div className="p-4 bg-white rounded-lg shadow-md md:p-6 dark:bg-gray-800 lg:col-span-3">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                                Detalles de Venta #{customSale.sales[0].id}
                            </h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Fecha</p>
                                    <p className="font-semibold dark:text-white">{customSale.sales[0].created_at}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Vendedor</p>
                                    <p className="font-semibold dark:text-white">{customSale.sales[0].user_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Método de Pago</p>
                                    <p className="font-semibold dark:text-white">{customSale.sales[0].payment_method || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                                    <p className="font-semibold text-green-600 dark:text-green-400">${customSale.sales[0].total.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Tabla de productos */}
                            {customSale.saleDetails && customSale.saleDetails.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="mb-3 font-semibold text-gray-800 dark:text-white">Productos</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-100 border-b dark:bg-gray-700 dark:border-gray-600">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Producto</th>
                                                    <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Cantidad</th>
                                                    <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Precio Unit.</th>
                                                    <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customSale.saleDetails.map((item, index) => (
                                                    <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                        <td className="px-4 py-2 dark:text-white">{item.product_name || 'Producto'}</td>
                                                        <td className="px-4 py-2 text-right dark:text-white">{item.quantity}</td>
                                                        <td className="px-4 py-2 text-right dark:text-white">${item.unit_price.toFixed(2)}</td>
                                                        <td className="px-4 py-2 font-semibold text-right dark:text-white">${item.subtotal.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resumen (ocupa 1/3) */}
                        <div>
                            <ReportPreview
                                report={customSale}
                                loading={loading}
                                onDownloadPDF={handleDownloadPDF}
                            />
                        </div>
                    </div>
                ) : currentReportType !== REPORT_TYPES.CUSTOM ? (
                    // Mostrar gráfico y resumen para reportes de período
                    <div className="grid grid-cols-1 gap-4 mb-6 md:gap-6 lg:grid-cols-4">
                        {/* Tabla de datos del reporte (ocupa 3/4) */}
                        <div className="lg:col-span-3">
                            <ReportChart
                                data={chartData}
                                reportType={currentReportType}
                                loading={loading}
                            />
                        </div>

                        {/* Resumen Reporte Diario/Semanal/etc. (ocupa 1/4) */}
                        <div>
                            <ReportPreview
                                report={reportData}
                                loading={loading}
                                onDownloadPDF={handleDownloadPDF}
                            />
                        </div>
                    </div>
                ) : null}

                {/* INFORMACIÓN ADICIONAL */}
                {reportData && (
                    <div className="p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
                            Información del Reporte
                        </h3>
                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 dark:text-gray-400 md:grid-cols-2">
                            <p>
                                <strong className="dark:text-white">Generado:</strong>{' '}
                                {reportData.generatedAt?.toLocaleString('es-ES')}
                            </p>
                            <p>
                                <strong className="dark:text-white">Ventas procesadas:</strong> {reportData.sales?.length || 0}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast de notificación */}
            {toast && (
                <Toast
                    variant={toast.variant}
                    title={toast.title}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
