import { useState, useCallback } from 'react';
import { REPORT_TYPES, REPORT_DATE_RANGES } from '../types/reportTypes';

/**
 * Hook personalizado para obtener y procesar datos de reportes
 * Maneja: obtener datos, calcular estadísticas, formatear para gráficos
 */
export function useReports() {
    // ============ ESTADOS ============
    // Qué reporte está mostrando ahora
    const [currentReportType, setCurrentReportType] = useState(REPORT_TYPES.DAILY);

    // Los datos del reporte actual
    const [reportData, setReportData] = useState(null);

    // Fechas personalizadas si el usuario elige rango específico
    const [customDateRange, setCustomDateRange] = useState({
        start: null,
        end: null,
    });

    // Mostrar loading mientras se cargan datos
    const [loading, setLoading] = useState(false);

    // Si hay error, guardarlo aquí
    const [error, setError] = useState(null);

    // ============ FUNCIONES ============

    /**
     * Calcula fechas de inicio y fin según el tipo de reporte
     * Por ejemplo: Si es DAILY, fechaFin = hoy, fechaInicio = hoy - 1 día
     */
    const calculateDateRange = useCallback((reportType, customRange = null) => {
        const endDate = new Date(); // Hoy
        const startDate = new Date();

        if (customRange && customRange.start && customRange.end) {
            // Si el usuario eligió fechas personalizadas válidas, usarlas
            return customRange;
        }

        // Si no, calcular según tipo de reporte
        const daysBack = REPORT_DATE_RANGES[reportType] || 1;
        startDate.setDate(endDate.getDate() - daysBack);

        return { start: startDate, end: endDate };
    }, []);

    /**
     * Obtiene las ventas de la BD en un rango de fechas
     * Llama a Electron IPC para consultar la base de datos
     */
    const fetchSalesData = useCallback(async (startDate, endDate) => {
        try {
            setLoading(true);
            setError(null);

            // Validar que las fechas no sean null
            if (!startDate || !endDate) {
                throw new Error("Las fechas de inicio y fin son requeridas");
            }

            // Llamar al backend de Electron
            const sales = await window.api.reports.getSalesByDateRange(
                startDate.toISOString(),
                endDate.toISOString()
            );

            return sales;
        } catch (err) {
            setError(err.message);
            console.error('Error fetching sales data:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Calcula estadísticas básicas: total vendido, cantidad de transacciones, etc
     */
    const calculateStatistics = useCallback((sales) => {
        if (!sales || sales.length === 0) {
            return {
                totalSales: 0,
                transactionCount: 0,
                averageTransaction: 0,
            };
        }

        const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
        const transactionCount = sales.length;
        const averageTransaction = totalSales / transactionCount;

        return {
            totalSales: Math.round(totalSales * 100) / 100,
            transactionCount,
            averageTransaction: Math.round(averageTransaction * 100) / 100,
        };
    }, []);

    /**
     * Obtiene y procesa un reporte completo
     * Es la función principal que llaman los componentes
     */
    const getReport = useCallback(
        async (reportType, customRange = null) => {
            try {
                setLoading(true);
                setError(null);

                // 1. Calcular fechas
                const dateRange = calculateDateRange(reportType, customRange);

                // 2. Obtener datos de BD
                const sales = await fetchSalesData(dateRange.start, dateRange.end);

                // 3. Calcular estadísticas
                const statistics = calculateStatistics(sales);

                // 4. Armar el reporte
                const report = {
                    type: reportType,
                    dateRange,
                    summary: statistics,
                    sales,
                    generatedAt: new Date(),
                };

                setReportData(report);
                setCurrentReportType(reportType);
                if (customRange) {
                    setCustomDateRange(customRange);
                }

                return report;
            } catch (err) {
                setError(err.message);
                console.error('Error generating report:', err);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [calculateDateRange, fetchSalesData, calculateStatistics]
    );

    // ============ RETORNAR ============
    // Esto es lo que los componentes pueden usar
    return {
        // Estado
        currentReportType,
        reportData,
        customDateRange,
        loading,
        error,

        // Funciones
        getReport,
        setCurrentReportType,
        setCustomDateRange,
    };
}