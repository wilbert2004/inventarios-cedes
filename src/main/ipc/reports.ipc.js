const { ipcMain } = require("electron");
const db = require("../db/connection");

/**
 * Obtiene todas las ventas en un rango de fechas
 * Recibe: startDate (ISO string), endDate (ISO string)
 * Retorna: Array de ventas con sus detalles
 */
ipcMain.handle("reports:getSalesByDateRange", async (event, startDate, endDate) => {
    try {
        // Verificar que las fechas sean válidas
        if (!startDate || !endDate) {
            throw new Error("Fechas de inicio y fin son requeridas");
        }

        // Convertir strings ISO a formato que SQLite entienda
        // "2026-01-05T00:00:00.000Z" → "2026-01-05"
        const start = new Date(startDate).toISOString().split('T')[0];
        const end = new Date(endDate).toISOString().split('T')[0];

        // Consulta SQL: obtener todas las ventas en el rango
        // DATE(created_at) extrae solo la fecha (sin hora)
        const query = `
      SELECT 
        s.id,
        s.user_id,
        s.total,
        s.payment_method,
        s.created_at,
        u.name as user_name,
        COUNT(si.id) as item_count
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN sale_items si ON s.id = si.sale_id
      WHERE DATE(s.created_at) BETWEEN ? AND ?
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `;

        const sales = db.prepare(query).all(start, end);

        return sales;
    } catch (error) {
        console.error("Error getting sales by date range:", error);
        throw error;
    }
});

/**
 * Obtiene el detalle completo de una venta (con todos los productos)
 * Usado cuando el usuario quiere ver detalles de una venta específica
 */
ipcMain.handle("reports:getSaleDetail", async (event, saleId) => {
    try {
        if (!saleId) {
            throw new Error("Sale ID es requerido");
        }

        // Obtener datos de la venta
        const saleQuery = `
      SELECT 
        s.id,
        s.user_id,
        s.total,
        s.payment_method,
        s.created_at,
        u.name as user_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.id = ?
    `;

        const sale = db.prepare(saleQuery).get(saleId);

        if (!sale) {
            throw new Error(`Venta con ID ${saleId} no encontrada`);
        }

        // Obtener todos los items de esa venta
        const itemsQuery = `
      SELECT 
        si.id,
        si.product_id,
        si.quantity,
        si.unit_price,
        si.subtotal,
        p.name as product_name
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      WHERE si.sale_id = ?
    `;

        const items = db.prepare(itemsQuery).all(saleId);

        // Retornar venta con items
        return {
            ...sale,
            items,
        };
    } catch (error) {
        console.error("Error getting sale detail:", error);
        throw error;
    }
});

/**
 * Obtiene estadísticas por día (útil para gráficos)
 * Retorna: Array con total por cada día
 */
ipcMain.handle("reports:getDailyStats", async (event, startDate, endDate) => {
    try {
        const start = new Date(startDate).toISOString().split('T')[0];
        const end = new Date(endDate).toISOString().split('T')[0];

        const query = `
      SELECT 
        DATE(s.created_at) as date,
        COUNT(s.id) as transaction_count,
        SUM(s.total) as total_sales,
        AVG(s.total) as average_transaction
      FROM sales s
      WHERE DATE(s.created_at) BETWEEN ? AND ?
      GROUP BY DATE(s.created_at)
      ORDER BY DATE(s.created_at) ASC
    `;

        const stats = db.prepare(query).all(start, end);

        return stats;
    } catch (error) {
        console.error("Error getting daily stats:", error);
        throw error;
    }
});

/**
 * Obtiene los productos más vendidos en un rango de fechas
 * Útil para saber qué vende más
 */
ipcMain.handle("reports:getTopProducts", async (event, startDate, endDate, limit = 10) => {
    try {
        const start = new Date(startDate).toISOString().split('T')[0];
        const end = new Date(endDate).toISOString().split('T')[0];

        const query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        SUM(si.quantity) as total_quantity,
        SUM(si.subtotal) as total_revenue,
        COUNT(DISTINCT s.id) as sold_in_transactions
      FROM sale_items si
      LEFT JOIN products p ON si.product_id = p.id
      LEFT JOIN sales s ON si.sale_id = s.id
      WHERE DATE(s.created_at) BETWEEN ? AND ?
      GROUP BY p.id
      ORDER BY total_quantity DESC
      LIMIT ?
    `;

        const topProducts = db.prepare(query).all(start, end, limit);

        return topProducts;
    } catch (error) {
        console.error("Error getting top products:", error);
        throw error;
    }
});

/**
 * Genera un PDF del reporte y lo guarda en la carpeta elegida por el usuario
 */
ipcMain.handle("reports:generatePDF", async (event, reportData, reportType) => {
    try {
        console.log('=== Iniciando generatePDF ===');
        console.log('reportType:', reportType);
        console.log('reportData:', JSON.stringify(reportData, null, 2));

        const { dialog } = require("electron");
        const { jsPDF } = require("jspdf");
        const fs = require("fs");

        // Validar datos
        if (!reportData) {
            throw new Error("Los datos del reporte son inválidos");
        }

        // Validar según tipo de reporte
        if (reportType !== "custody-detail" && !reportData.dateRange) {
            throw new Error("Los datos del reporte son inválidos");
        }

        if (reportType === "custody-detail" && !reportData.product) {
            throw new Error("Falta la información del producto");
        }

        console.log('Validaciones pasadas correctamente');

        // Obtener información de la empresa (opcional - puede no existir la tabla settings)
        let companyInfo = {
            company_name: 'Absolute Gestión de Bienes',
            company_rfc: '',
            company_phone: '',
            company_address: '',
            company_email: '',
            company_website: ''
        };

        try {
            const companyStmt = db.prepare(`
                SELECT key, value FROM settings 
                WHERE key IN ('company_name', 'company_rfc', 'company_phone', 'company_address', 'company_email', 'company_website')
            `);
            const companyRows = companyStmt.all();
            companyRows.forEach(row => {
                companyInfo[row.key] = row.value || '';
            });
            console.log('Información de empresa cargada:', companyInfo);
        } catch (settingsError) {
            console.warn('No se pudo cargar información de empresa (tabla settings no existe):', settingsError.message);
            // Continuar con valores por defecto
        }

        // 1. ABRIR DIÁLOGO PARA ELEGIR DÓNDE GUARDAR
        const fileName = reportType === "CUSTOM"
            ? `Venta-${reportData.sales[0]?.id || 'unknown'}-${new Date().toISOString().split('T')[0]}.pdf`
            : reportType === "custody-detail"
                ? `Bien-${reportData.product?.inventory_number || 'desconocido'}-${new Date().toISOString().split('T')[0]}.pdf`
                : `Reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;

        console.log('Nombre de archivo sugerido:', fileName);
        console.log('Abriendo diálogo para guardar...');

        const { filePath, canceled } = await dialog.showSaveDialog({
            title: "Guardar Reporte PDF",
            defaultPath: fileName,
            filters: [
                { name: "PDF", extensions: ["pdf"] },
                { name: "Todos", extensions: ["*"] },
            ],
        });

        console.log('Resultado del diálogo - canceled:', canceled, 'filePath:', filePath);

        // Si el usuario canceló, retornar null
        if (canceled || !filePath) {
            console.log('Usuario canceló la descarga');
            return null;
        }

        // 2. CREAR DOCUMENTO PDF
        const doc = new jsPDF();
        let yPosition = 10;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // ============ FUNCIÓN HELPER: ENCABEZADO CON INFORMACIÓN DE LA EMPRESA ============
        const drawCompanyHeader = () => {
            // Rectángulo de fondo para el encabezado (color azul/gris)
            doc.setFillColor(41, 128, 185); // Azul corporativo
            doc.rect(0, 0, pageWidth, 45, 'F');

            // Nombre de la empresa (grande y blanco)
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.setFont(undefined, 'bold');
            doc.text(companyInfo.company_name || 'EMPRESA SIN NOMBRE', pageWidth / 2, 15, { align: 'center' });

            // Línea decorativa
            doc.setDrawColor(255, 255, 255);
            doc.setLineWidth(0.5);
            doc.line(40, 20, pageWidth - 40, 20);

            // Información de contacto (más pequeña)
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            let infoY = 26;

            if (companyInfo.company_rfc) {
                doc.text(`RFC: ${companyInfo.company_rfc}`, pageWidth / 2, infoY, { align: 'center' });
                infoY += 4;
            }

            if (companyInfo.company_phone) {
                doc.text(`Tel: ${companyInfo.company_phone}`, pageWidth / 2, infoY, { align: 'center' });
                infoY += 4;
            }

            if (companyInfo.company_email) {
                doc.text(`Email: ${companyInfo.company_email}`, pageWidth / 2, infoY, { align: 'center' });
                infoY += 4;
            }

            if (companyInfo.company_address) {
                doc.text(companyInfo.company_address, pageWidth / 2, infoY, { align: 'center' });
            }

            // Reset color de texto para el resto del documento
            doc.setTextColor(0, 0, 0);

            return 50; // Retornar posición Y después del encabezado
        };

        // ============ FORMATO DIFERENTE PARA VENTA ESPECÍFICA ============
        if (reportType === "CUSTOM" && reportData.sales && reportData.sales.length > 0) {
            const sale = reportData.sales[0];

            // Dibujar encabezado de empresa
            yPosition = drawCompanyHeader();
            yPosition += 5;

            // Título del documento con fondo
            doc.setFillColor(236, 240, 241); // Gris claro
            doc.rect(10, yPosition, pageWidth - 20, 12, 'F');
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(52, 73, 94); // Azul oscuro
            doc.text("COMPROBANTE DE VENTA", pageWidth / 2, yPosition + 8, { align: "center" });
            yPosition += 17;

            // Reset color
            doc.setTextColor(0, 0, 0);

            // Caja de información de la venta
            doc.setDrawColor(189, 195, 199);
            doc.setLineWidth(0.5);
            doc.roundedRect(10, yPosition, pageWidth - 20, 30, 2, 2, 'S');

            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Folio:`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(`#${sale.id}`, 35, yPosition);

            doc.setFont(undefined, 'bold');
            doc.text(`Fecha:`, pageWidth - 100, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(new Date(sale.created_at).toLocaleString("es-ES"), pageWidth - 75, yPosition);

            yPosition += 7;
            doc.setFont(undefined, 'bold');
            doc.text(`Vendedor:`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(sale.user_name || "N/A", 40, yPosition);

            yPosition += 7;
            doc.setFont(undefined, 'bold');
            doc.text(`Metodo de Pago:`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(sale.payment_method || "N/A", 50, yPosition);

            yPosition += 12;

            // TABLA DE PRODUCTOS
            // Encabezado de sección
            doc.setFillColor(52, 73, 94); // Azul oscuro
            doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("DETALLE DE PRODUCTOS", 15, yPosition + 5.5);
            doc.setTextColor(0, 0, 0);
            yPosition += 11;

            // Encabezados de tabla con fondo
            doc.setFillColor(149, 165, 166); // Gris medio
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text("Producto", 13, yPosition + 5);
            doc.text("Cant.", 115, yPosition + 5);
            doc.text("P. Unit.", 135, yPosition + 5);
            doc.text("Subtotal", 165, yPosition + 5);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            // Filas de productos con alternancia de colores
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);

            if (reportData.saleDetails && reportData.saleDetails.length > 0) {
                reportData.saleDetails.forEach((item, index) => {
                    if (yPosition > pageHeight - 40) {
                        doc.addPage();
                        yPosition = drawCompanyHeader() + 10;
                    }

                    // Fondo alternado
                    if (index % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(10, yPosition - 4, pageWidth - 20, 6, 'F');
                    }

                    doc.text((item.product_name || "Producto").substring(0, 50), 13, yPosition);
                    doc.text(item.quantity.toString(), 115, yPosition);
                    doc.text(`$${item.unit_price.toFixed(2)}`, 135, yPosition);
                    doc.text(`$${item.subtotal.toFixed(2)}`, 165, yPosition);
                    yPosition += 6;
                });
            }

            yPosition += 5;

            // TOTAL con diseño destacado
            doc.setFillColor(46, 204, 113); // Verde
            doc.roundedRect(pageWidth - 75, yPosition, 65, 15, 2, 2, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("TOTAL:", pageWidth - 70, yPosition + 6);
            doc.setFontSize(14);
            doc.text(`$${sale.total.toFixed(2)}`, pageWidth - 70, yPosition + 12);

            doc.setTextColor(0, 0, 0);
            yPosition += 22;

            // Nota de agradecimiento
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(127, 140, 141);
            doc.text("¡Gracias por su compra!", pageWidth / 2, yPosition, { align: "center" });

            // Pie de página con información adicional
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(127, 140, 141);
            doc.text("Documento generado automáticamente por el Sistema POS", pageWidth / 2, pageHeight - 15, { align: "center" });
            if (companyInfo.company_website) {
                doc.text(companyInfo.company_website, pageWidth / 2, pageHeight - 10, { align: "center" });
            }
            doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, pageHeight - 5, { align: "center" });
        } else if (reportType === "custody-detail" && reportData.product) {
            // ============ FORMATO PARA DETALLE DE PRODUCTO EN CUSTODIA ============
            const product = reportData.product;

            // Dibujar encabezado de empresa
            yPosition = drawCompanyHeader();
            yPosition += 5;

            // Título del documento con fondo
            doc.setFillColor(41, 128, 185); // Azul
            doc.rect(10, yPosition, pageWidth - 20, 12, 'F');
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text("DETALLE DE BIEN EN CUSTODIA", pageWidth / 2, yPosition + 8, { align: "center" });
            doc.setTextColor(0, 0, 0);
            yPosition += 17;

            // SECCIÓN 1: Identificación del Producto
            doc.setFillColor(52, 152, 219); // Azul claro
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("IDENTIFICACION DEL PRODUCTO", 15, yPosition + 5);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            doc.setFontSize(9);
            const section1Items = [
                { label: "No Inventario:", value: product.inventory_number, bold: true },
                { label: "No Serie:", value: product.serial_number },
                { label: "Descripcion:", value: product.description },
                { label: "Marca:", value: product.brand },
                { label: "Modelo:", value: product.model }
            ];

            section1Items.forEach((item) => {
                doc.setFont(undefined, 'bold');
                doc.text(item.label, 15, yPosition);
                doc.setFont(undefined, item.bold ? 'bold' : 'normal');
                doc.text(item.value, 50, yPosition);
                yPosition += 6;
            });

            yPosition += 3;

            // SECCIÓN 2: Estado y Clasificación
            doc.setFillColor(46, 204, 113); // Verde
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("ESTADO Y CLASIFICACION", 15, yPosition + 5);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            doc.setFontSize(9);
            const section2Items = [
                { label: "Estado Actual:", value: product.product_status },
                { label: "Motivo:", value: product.reason },
                { label: "Cantidad:", value: product.quantity.toString() }
            ];

            section2Items.forEach((item) => {
                doc.setFont(undefined, 'bold');
                doc.text(item.label, 15, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(item.value, 50, yPosition);
                yPosition += 6;
            });

            yPosition += 3;

            // SECCIÓN 3: Datos de Origen
            doc.setFillColor(155, 89, 182); // Morado
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("DATOS DE ORIGEN", 15, yPosition + 5);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            doc.setFontSize(9);
            const section3Items = [
                { label: "Centro de Trabajo:", value: product.center_origin },
                { label: "Folio de Referencia:", value: product.reference_folio },
                { label: "Entregado por:", value: product.entregado_por_centro_trabajo },
                { label: "Fecha de Entrega:", value: product.fecha_entrega ? new Date(product.fecha_entrega).toLocaleDateString("es-MX") : 'N/A' }
            ];

            section3Items.forEach((item) => {
                doc.setFont(undefined, 'bold');
                doc.text(item.label, 15, yPosition);
                doc.setFont(undefined, 'normal');
                doc.text(item.value, 55, yPosition);
                yPosition += 6;
            });

            yPosition += 3;

            // SECCIÓN 4: Datos de Recepción
            doc.setFillColor(230, 126, 34); // Naranja
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("DATOS DE RECEPCION", 15, yPosition + 5);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text("Chofer:", 15, yPosition);
            yPosition += 5;

            doc.setFont(undefined, 'normal');
            doc.text(`Recibido por: ${product.recibido_por_chofer}`, 20, yPosition);
            yPosition += 5;
            doc.text(`Fecha: ${product.fecha_recepcion_chofer ? new Date(product.fecha_recepcion_chofer).toLocaleDateString("es-MX") : 'N/A'}`, 20, yPosition);
            yPosition += 8;

            doc.setFont(undefined, 'bold');
            doc.text("Almacen:", 15, yPosition);
            yPosition += 5;

            doc.setFont(undefined, 'normal');
            doc.text(`Recibido por: ${product.recibido_por_almacen}`, 20, yPosition);
            yPosition += 5;
            doc.text(`Fecha: ${product.fecha_recepcion_almacen ? new Date(product.fecha_recepcion_almacen).toLocaleDateString("es-MX") : 'N/A'}`, 20, yPosition);
            yPosition += 8;

            // SECCIÓN 5: Información Adicional
            doc.setFillColor(149, 165, 166); // Gris
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text("INFORMACION ADICIONAL", 15, yPosition + 5);
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.text("Notas-Observaciones:", 15, yPosition);
            yPosition += 5;
            doc.setFont(undefined, 'normal');
            const notesLines = doc.splitTextToSize(product.notes, pageWidth - 30);
            doc.text(notesLines, 15, yPosition);
            yPosition += notesLines.length * 5 + 5;

            doc.setFont(undefined, 'bold');
            doc.text("Fecha de Registro:", 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(product.created_at ? new Date(product.created_at).toLocaleDateString("es-MX") : 'N/A', 55, yPosition);
            yPosition += 6;

            doc.setFont(undefined, 'bold');
            doc.text("Fecha de Baja:", 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(product.fecha_baja ? new Date(product.fecha_baja).toLocaleDateString("es-MX") : 'N/A', 55, yPosition);

            // Pie de página
            doc.setFontSize(8);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(127, 140, 141);
            doc.text("Documento generado automaticamente - Sistema de Gestion de Bienes", pageWidth / 2, pageHeight - 15, { align: "center" });
            doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        } else {
            // ============ FORMATO PARA REPORTES DE PERÍODO ============

            // Dibujar encabezado de empresa
            yPosition = drawCompanyHeader();
            yPosition += 5;

            // Título del documento con fondo
            const isMovements = reportType === "inventory-movements";
            doc.setFillColor(236, 240, 241);
            doc.rect(10, yPosition, pageWidth - 20, 12, 'F');
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(52, 73, 94);
            doc.text(isMovements ? "REPORTE DE MOVIMIENTOS" : "REPORTE DE VENTAS", pageWidth / 2, yPosition + 8, { align: "center" });
            doc.setTextColor(0, 0, 0);
            yPosition += 17;

            // Información del reporte en caja
            doc.setDrawColor(189, 195, 199);
            doc.setLineWidth(0.5);
            doc.roundedRect(10, yPosition, pageWidth - 20, 25, 2, 2, 'S');

            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text(`Tipo de Reporte:`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(getReportTypeName(reportType), 50, yPosition);

            yPosition += 7;
            doc.setFont(undefined, 'bold');
            doc.text(`Periodo:`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(
                `${reportData.dateRange.start.toLocaleDateString("es-ES")} al ${reportData.dateRange.end.toLocaleDateString("es-ES")}`,
                35,
                yPosition
            );

            yPosition += 7;
            doc.setFont(undefined, 'bold');
            doc.text(`Generado:`, 15, yPosition);
            doc.setFont(undefined, 'normal');
            doc.text(new Date().toLocaleString("es-ES"), 40, yPosition);

            yPosition += 12;

            // RESUMEN ESTADÍSTICO - Tarjetas visuales
            doc.setFillColor(52, 73, 94);
            doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text("RESUMEN GENERAL", 15, yPosition + 5.5);
            doc.setTextColor(0, 0, 0);
            yPosition += 13;

            // Tarjetas de estadísticas (3 columnas)
            const cardWidth = (pageWidth - 40) / 3;

            // Tarjeta 1: Total Vendido
            doc.setFillColor(46, 204, 113); // Verde
            doc.roundedRect(10, yPosition, cardWidth - 2, 20, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text("Total Vendido", 15, yPosition + 6);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`$${reportData.summary.totalSales.toFixed(2)}`, 15, yPosition + 15);

            // Tarjeta 2: Transacciones
            doc.setFillColor(52, 152, 219); // Azul
            doc.roundedRect(10 + cardWidth + 2, yPosition, cardWidth - 2, 20, 2, 2, 'F');
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text("Transacciones", 15 + cardWidth + 2, yPosition + 6);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`${reportData.summary.transactionCount}`, 15 + cardWidth + 2, yPosition + 15);

            // Tarjeta 3: Ticket Promedio
            doc.setFillColor(155, 89, 182); // Morado
            doc.roundedRect(10 + (cardWidth + 2) * 2, yPosition, cardWidth - 2, 20, 2, 2, 'F');
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');
            doc.text("Ticket Promedio", 15 + (cardWidth + 2) * 2, yPosition + 6);
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text(`$${reportData.summary.averageTransaction.toFixed(2)}`, 15 + (cardWidth + 2) * 2, yPosition + 15);

            doc.setTextColor(0, 0, 0);
            yPosition += 25;

            // DETALLE DE TRANSACCIONES / MOVIMIENTOS
            doc.setFillColor(52, 73, 94);
            doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(isMovements ? "DETALLE DE MOVIMIENTOS" : "DETALLE DE TRANSACCIONES", 15, yPosition + 5.5);
            doc.setTextColor(0, 0, 0);
            yPosition += 11;

            // Encabezados de tabla con fondo
            doc.setFillColor(149, 165, 166);
            doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
            doc.setFontSize(9);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(255, 255, 255);
            if (isMovements) {
                doc.text("Fecha", 13, yPosition + 5);
                doc.text("Producto", 50, yPosition + 5);
                doc.text("Código", 100, yPosition + 5);
                doc.text("Tipo", 130, yPosition + 5);
                doc.text("Cant.", 150, yPosition + 5);
                doc.text("Ref.", 170, yPosition + 5);
            } else {
                doc.text("Folio", 13, yPosition + 5);
                doc.text("Fecha", 35, yPosition + 5);
                doc.text("Vendedor", 75, yPosition + 5);
                doc.text("Método", 130, yPosition + 5);
                doc.text("Total", 170, yPosition + 5);
            }
            doc.setTextColor(0, 0, 0);
            yPosition += 10;

            // Filas
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);

            if (isMovements ? (reportData.movements && reportData.movements.length > 0) : (reportData.sales && reportData.sales.length > 0)) {
                const rows = isMovements ? reportData.movements : reportData.sales;
                rows.forEach((row, index) => {
                    // Verificar si necesita nueva página
                    if (yPosition > pageHeight - 30) {
                        doc.addPage();
                        yPosition = drawCompanyHeader() + 10;

                        // Re-dibujar encabezados de tabla
                        doc.setFillColor(149, 165, 166);
                        doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
                        doc.setFontSize(9);
                        doc.setFont(undefined, 'bold');
                        doc.setTextColor(255, 255, 255);
                        if (isMovements) {
                            doc.text("Fecha", 13, yPosition + 5);
                            doc.text("Producto", 50, yPosition + 5);
                            doc.text("Código", 100, yPosition + 5);
                            doc.text("Tipo", 130, yPosition + 5);
                            doc.text("Cant.", 150, yPosition + 5);
                            doc.text("Ref.", 170, yPosition + 5);
                        } else {
                            doc.text("Folio", 13, yPosition + 5);
                            doc.text("Fecha", 35, yPosition + 5);
                            doc.text("Vendedor", 75, yPosition + 5);
                            doc.text("Método", 130, yPosition + 5);
                            doc.text("Total", 170, yPosition + 5);
                        }
                        doc.setTextColor(0, 0, 0);
                        yPosition += 10;
                        doc.setFont(undefined, 'normal');
                    }

                    // Fondo alternado
                    if (index % 2 === 0) {
                        doc.setFillColor(250, 250, 250);
                        doc.rect(10, yPosition - 4, pageWidth - 20, 6, 'F');
                    }

                    if (isMovements) {
                        doc.text(new Date(row.created_at).toLocaleDateString('es-ES'), 13, yPosition);
                        doc.text((row.product_name || "").substring(0, 35), 50, yPosition);
                        doc.text((row.product_barcode || "").substring(0, 15), 100, yPosition);
                        doc.text(row.type || '', 130, yPosition);
                        doc.text(String(row.quantity || 0), 150, yPosition);
                        doc.text((row.reference || '').substring(0, 12), 170, yPosition);
                    } else {
                        doc.text(`#${row.id.toString()}`, 13, yPosition);
                        doc.text(row.created_at.substring(0, 10), 35, yPosition);
                        doc.text((row.user_name || "N/A").substring(0, 25), 75, yPosition);
                        doc.text((row.payment_method || "N/A").substring(0, 15), 130, yPosition);
                        doc.text(`$${row.total.toFixed(2)}`, 170, yPosition);
                    }
                    yPosition += 6;
                });
            } else {
                doc.setFillColor(250, 250, 250);
                doc.rect(10, yPosition - 4, pageWidth - 20, 8, 'F');
                doc.setTextColor(127, 140, 141);
                doc.text(isMovements ? "No hay movimientos en este período" : "No hay ventas registradas en este período", pageWidth / 2, yPosition, { align: "center" });
                doc.setTextColor(0, 0, 0);
                yPosition += 8;
            }

            // Pie de página con información adicional
            yPosition = pageHeight - 20;
            doc.setFontSize(7);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(127, 140, 141);
            doc.text("Documento generado automáticamente por el Sistema POS", pageWidth / 2, pageHeight - 15, { align: "center" });
            if (companyInfo.company_website) {
                doc.text(companyInfo.company_website, pageWidth / 2, pageHeight - 10, { align: "center" });
            }
            doc.text(`Generado: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, pageHeight - 5, { align: "center" });
        }

        // 3. GUARDAR ARCHIVO
        const pdfBuffer = doc.output("arraybuffer");
        fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

        console.log('PDF guardado exitosamente en:', filePath);
        return { success: true, filePath, fileName: fileName.split('/').pop().split('\\').pop() };
    } catch (error) {
        console.error("Error generating PDF:", error);
        console.error("Stack trace:", error.stack);
        return { success: false, error: error.message || 'Error al generar el PDF' };
    }
});

/**
 * Función auxiliar: Obtener nombre legible del tipo de reporte
 */
function getReportTypeName(type) {
    const names = {
        daily: "Reporte Diario",
        weekly: "Reporte Semanal",
        monthly: "Reporte Mensual",
        yearly: "Reporte Anual",
    };
    return names[type] || type;
}

/**
 * Generar Comprobante de Resguardo de Bienes (Custody Voucher)
 */
ipcMain.handle("reports:generateCustodyVoucher", async (event, custodyId) => {
    try {
        const { dialog } = require("electron");
        const { jsPDF } = require("jspdf");
        const fs = require("fs");

        // Obtener datos del resguardo
        const custodyEntry = db.prepare(
            "SELECT * FROM custody_entries WHERE id = ?"
        ).get(custodyId);

        if (!custodyEntry) {
            throw new Error("Resguardo no encontrado");
        }

        const custodyItems = db.prepare(
            "SELECT * FROM custody_items WHERE custody_entry_id = ?"
        ).all(custodyId);

        // Obtener información de la empresa
        const companyRows = db.prepare(`
            SELECT key, value FROM settings 
            WHERE key IN ('company_name', 'company_rfc', 'company_phone', 'company_address', 'company_email', 'company_website')
        `).all();

        const companyInfo = {};
        companyRows.forEach(row => {
            companyInfo[row.key] = row.value || '';
        });

        // Diálogo para guardar
        const fileName = `Resguardo-${custodyEntry.folio}-${new Date().toISOString().split('T')[0]}.pdf`;

        const { filePath, canceled } = await dialog.showSaveDialog({
            title: "Guardar Comprobante de Resguardo",
            defaultPath: fileName,
            filters: [
                { name: "PDF", extensions: ["pdf"] },
                { name: "Todos", extensions: ["*"] },
            ],
        });

        if (canceled || !filePath) {
            return null;
        }

        // Crear PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPosition = 15;

        // ========== ENCABEZADO ==========
        doc.setFillColor(26, 35, 126); // Azul oscuro
        doc.rect(0, 0, pageWidth, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text("COMPROBANTE DE RESGUARDO DE BIENES", pageWidth / 2, 12, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text("Centro de Distribución y Resguardo (CEDES)", pageWidth / 2, 22, { align: 'center' });
        doc.text(companyInfo.company_name || "YUCATAN SEGEY", pageWidth / 2, 29, { align: 'center' });

        yPosition = 45;

        // ========== SECCIÓN 1: DATOS DEL DOCUMENTO ==========
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("DATOS DEL DOCUMENTO", 15, yPosition);
        yPosition += 7;

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Folio: `, 15, yPosition);
        doc.setFont(undefined, 'bold');
        doc.text(custodyEntry.folio, 40, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        doc.text(`Fecha: `, 15, yPosition);
        doc.setFont(undefined, 'bold');
        doc.text(new Date(custodyEntry.entry_date).toLocaleDateString("es-ES"), 40, yPosition);
        yPosition += 6;

        doc.setFont(undefined, 'normal');
        doc.text(`Estado: `, 15, yPosition);
        doc.setFont(undefined, 'bold');
        const statusColors = { EN_RESGUARDO: [76, 175, 80], DEVUELTO: [33, 150, 243], BAJA: [244, 67, 54], TRASLADO: [255, 152, 0] };
        const statusColor = statusColors[custodyEntry.status] || [100, 100, 100];
        doc.setTextColor(...statusColor);
        doc.text(custodyEntry.status, 40, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;

        // ========== SECCIÓN 2: DATOS DEL ORIGEN ==========
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text("ORIGEN (PLANTA/CENTRO)", 15, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${custodyEntry.origin_plant_name}`, 15, yPosition);
        yPosition += 4;

        if (custodyEntry.origin_plant_code) {
            doc.text(`Código: ${custodyEntry.origin_plant_code}`, 15, yPosition);
            yPosition += 4;
        }

        if (custodyEntry.origin_municipality) {
            doc.text(`Municipio: ${custodyEntry.origin_municipality}`, 15, yPosition);
            yPosition += 4;
        }

        if (custodyEntry.origin_address) {
            doc.text(`Dirección: ${custodyEntry.origin_address}`, 15, yPosition);
            yPosition += 4;
        }

        yPosition += 5;

        // ========== SECCIÓN 3: RESPONSABLES ==========
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.text("CADENA DE CUSTODIA", 15, yPosition);
        yPosition += 6;

        // Responsable 1
        doc.setFillColor(235, 235, 235);
        doc.rect(15, yPosition - 3, pageWidth - 30, 18, 'F');
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text("1. ENTREGA", 18, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${custodyEntry.delivered_by_name}`, 18, yPosition + 5);
        doc.text(`Cargo: ${custodyEntry.delivered_by_position || 'N/A'}`, 18, yPosition + 9);
        doc.text(`Firma: _____________________`, 115, yPosition + 9);
        yPosition += 22;

        // Responsable 2
        doc.setFillColor(245, 245, 245);
        doc.rect(15, yPosition - 3, pageWidth - 30, 18, 'F');
        doc.setFont(undefined, 'bold');
        doc.text("2. TRANSPORTE", 18, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${custodyEntry.transported_by_name}`, 18, yPosition + 5);
        doc.text(`Licencia: ${custodyEntry.transported_by_license || 'N/A'}`, 18, yPosition + 9);
        doc.text(`Firma: _____________________`, 115, yPosition + 9);
        yPosition += 22;

        // Responsable 3
        doc.setFillColor(235, 235, 235);
        doc.rect(15, yPosition - 3, pageWidth - 30, 18, 'F');
        doc.setFont(undefined, 'bold');
        doc.text("3. RECIBE (CEDES)", 18, yPosition);
        doc.setFont(undefined, 'normal');
        doc.text(`Nombre: ${custodyEntry.received_by_name}`, 18, yPosition + 5);
        doc.text(`Cargo: ${custodyEntry.received_by_position || 'N/A'}`, 18, yPosition + 9);
        doc.text(`Firma: _____________________`, 115, yPosition + 9);
        yPosition += 25;

        // ========== TABLA DE BIENES ==========
        if (yPosition > pageHeight - 60) {
            doc.addPage();
            yPosition = 15;
        }

        doc.setFillColor(26, 35, 126);
        doc.rect(10, yPosition, pageWidth - 20, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text("DETALLE DE BIENES EN RESGUARDO", 15, yPosition + 5);
        doc.setTextColor(0, 0, 0);
        yPosition += 10;

        // Encabezados tabla
        doc.setFillColor(149, 165, 166);
        doc.rect(10, yPosition, pageWidth - 20, 7, 'F');
        doc.setFontSize(8);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text("#", 12, yPosition + 5);
        doc.text("Inv. #", 18, yPosition + 5);
        doc.text("Descripción", 40, yPosition + 5);
        doc.text("Cant.", 110, yPosition + 5);
        doc.text("Cond.", 125, yPosition + 5);
        doc.text("Serie", 145, yPosition + 5);
        doc.setTextColor(0, 0, 0);
        yPosition += 8;

        // Filas de bienes
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        custodyItems.forEach((item, index) => {
            if (yPosition > pageHeight - 25) {
                doc.addPage();
                yPosition = 15;
            }

            // Alternancia de colores
            if (index % 2 === 0) {
                doc.setFillColor(245, 245, 245);
                doc.rect(10, yPosition - 3, pageWidth - 20, 6, 'F');
            }

            doc.text(`${index + 1}`, 12, yPosition);
            doc.text(item.inventory_number, 18, yPosition);
            doc.text(doc.splitTextToSize(item.description, 65)[0], 40, yPosition);
            doc.text(item.quantity.toString(), 110, yPosition);
            doc.text(item.initial_condition, 125, yPosition);
            doc.text(item.serial_number || '-', 145, yPosition);
            yPosition += 6;
        });

        yPosition += 5;

        // ========== TOTALES ==========
        doc.setFillColor(52, 73, 94);
        doc.rect(10, yPosition, pageWidth - 20, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL DE BIENES: ${custodyItems.length} | CANTIDAD TOTAL: ${custodyItems.reduce((sum, i) => sum + i.quantity, 0)}`, 15, yPosition + 4);
        doc.setTextColor(0, 0, 0);
        yPosition += 12;

        // ========== PIE DE PÁGINA ==========
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text("_", 15, pageHeight - 30);
        doc.text("Este documento es un comprobante oficial de resguardo de bienes.", 15, pageHeight - 20);
        doc.text(`Generado: ${new Date().toLocaleString("es-ES")} | Sistema: Sistema de Inventario CEDES`, 15, pageHeight - 15);

        // Guardar
        const pdfBuffer = doc.output("arraybuffer");
        fs.writeFileSync(filePath, Buffer.from(pdfBuffer));

        return filePath;
    } catch (error) {
        console.error("Error generating custody voucher:", error);
        throw error;
    }
});
