const { BrowserWindow } = require("electron");
const db = require("../db/connection");

/**
 * Servicio de impresión de tickets
 */
class PrinterService {
  /**
   * Obtiene los datos de la empresa desde la configuración
   */
  getCompanyData() {
    try {
      const stmt = db.prepare(`
        SELECT key, value FROM settings 
        WHERE key IN ('company_name', 'company_rfc', 'company_phone', 'company_address', 'company_email', 'company_website')
      `);
      const rows = stmt.all();
      
      const company = {
        name: null,
        rfc: null,
        phone: null,
        address: null,
        email: null,
        website: null,
      };
      
      rows.forEach((row) => {
        const key = row.key.replace("company_", "");
        company[key] = row.value;
      });
      
      return company;
    } catch (error) {
      console.error("Error getting company data:", error);
      // Retornar valores por defecto si hay error
      return {
        name: null,
        rfc: null,
        phone: null,
        address: null,
        email: null,
        website: null,
      };
    }
  }

  /**
   * Genera el HTML del ticket
   */
  generateTicketHTML(saleData) {
    // Obtener datos de la empresa
    const company = this.getCompanyData();
    
    // Valores con fallback
    const companyName = company.name || "POS SYSTEM";
    const companyRfc = company.rfc || "---";
    const companyPhone = company.phone || "---";
    console.log('saleData --> printer.service.js', saleData);
    
    // Normalizar datos - puede venir de venta nueva o de historial
    const sale = saleData.sale || saleData;
    const items = saleData.items || [];
    const payment = saleData.payment || (sale.total ? parseFloat(sale.total) : 0);
    const change = saleData.change || 0;
    
    // Valores seguros con fallbacks
    const saleId = sale.saleId || sale.id || 0;
    const total = sale.total ? parseFloat(sale.total) : 0;
    const timestamp = sale.timestamp || sale.created_at || new Date().toISOString();
    const cashierName = sale.cashierName || 'Admin';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.3;
            color: #000;
            padding: 8px;
            width: 58mm;
            background: white;
          }
          
          .ticket {
            width: 100%;
          }
          
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          
          .header h1 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .header p {
            font-size: 10px;
            margin: 2px 0;
          }
          
          .info {
            margin-bottom: 15px;
            font-size: 11px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
          }
          
          .items {
            margin-bottom: 15px;
          }
          
          .item {
            margin-bottom: 10px;
          }
          
          .item-name {
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .item-details {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
          }
          
          .separator {
            border-top: 1px dashed #000;
            margin: 10px 0;
          }
          
          .separator-double {
            border-top: 2px solid #000;
            margin: 10px 0;
          }
          
          .totals {
            margin-bottom: 15px;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 12px;
          }
          
          .total-row.grand-total {
            font-size: 16px;
            font-weight: bold;
            margin-top: 10px;
          }
          
          .payment {
            margin-bottom: 15px;
          }
          
          .payment-row {
            display: flex;
            justify-content: space-between;
            margin: 3px 0;
            font-size: 13px;
          }
          
          .change {
            font-size: 16px;
            font-weight: bold;
          }
          
          .footer {
            text-align: center;
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px dashed #000;
            font-size: 11px;
          }
          
          @media print {
            body {
              width: 58mm;
              margin: 0 auto;
            }
            
            .ticket {
              page-break-after: avoid;
            }
          }
          
          @page {
            margin: 10mm;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <!-- Header -->
          <div class="header">
            <h1>${companyName}</h1>
            <p>Sistema de Punto de Venta</p>
            <p>RFC: ${companyRfc}</p>
            <p>Tel: ${companyPhone}</p>
            ${company.address ? `<p style="font-size: 9px; margin-top: 4px;">${company.address}</p>` : ''}
          </div>
          
          <!-- Información de la venta -->
          <div class="info">
            <div class="info-row">
              <span>Ticket #${saleId}</span>
              <span>${new Date(timestamp).toLocaleDateString('es-MX')}</span>
            </div>
            <div class="info-row">
              <span>Hora:</span>
              <span>${new Date(timestamp).toLocaleTimeString('es-MX')}</span>
            </div>
            <div class="info-row">
              <span>Cajero:</span>
              <span>${cashierName}</span>
            </div>
          </div>
          
          <div class="separator-double"></div>
          
          <!-- Items -->
          <div class="items">
            ${items.map(item => {
              const quantity = item.quantity || 0;
              const unitPrice = parseFloat(item.unitPrice || item.unit_price || 0);
              const subtotal = parseFloat(item.subtotal || (quantity * unitPrice));
              const productName = item.productName || item.product_name || item.name || 'Producto';
              const barcode = item.productBarcode || item.product_barcode || item.barcode;
              
              return `
                <div class="item">
                  <div class="item-name">${productName}</div>
                  ${barcode ? `<div style="font-size: 10px; color: #666;">Código: ${barcode}</div>` : ''}
                  <div class="item-details">
                    <span>${quantity} x $${unitPrice.toFixed(2)}</span>
                    <span>$${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          <div class="separator"></div>
          
          <!-- Totales -->
          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span>IVA (incluido):</span>
              <span>$${(total * 0.16 / 1.16).toFixed(2)}</span>
            </div>
            <div class="separator-double"></div>
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="separator"></div>
          
          <!-- Pago -->
          ${payment ? `
            <div class="payment">
              <div class="payment-row">
                <span>Pago con:</span>
                <span>$${payment.toFixed(2)}</span>
              </div>
              <div class="payment-row change">
                <span>Cambio:</span>
                <span>$${change.toFixed(2)}</span>
              </div>
            </div>
            <div class="separator"></div>
          ` : ''}
          
          <!-- Footer -->
          <div class="footer">
            <p>¡Gracias por su compra!</p>
            <p>Vuelva pronto</p>
            <p style="margin-top: 10px; font-size: 10px;">
              Este ticket es válido como comprobante de compra
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Obtener configuración de impresora desde la base de datos
   */
  getPrinterConfig() {
    try {
      const stmt = db.prepare(`
        SELECT key, value FROM settings 
        WHERE key IN ('printer_name', 'printer_paper_size', 'printer_copies', 'printer_silent', 'printer_color', 'printer_margin_top', 'printer_margin_bottom', 'printer_margin_left', 'printer_margin_right')
      `);
      const rows = stmt.all();
      
      const config = {
        printerName: null,
        paperSize: "Letter",
        copies: 1,
        silent: false,
        color: false,
        margins: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5,
        },
      };
      
      rows.forEach((row) => {
        const key = row.key.replace("printer_", "");
        switch (key) {
          case "name":
            config.printerName = row.value || null;
            break;
          case "paper_size":
            config.paperSize = row.value || "Letter";
            break;
          case "copies":
            config.copies = parseInt(row.value) || 1;
            break;
          case "silent":
            config.silent = row.value === "true";
            break;
          case "color":
            config.color = row.value === "true";
            break;
          case "margin_top":
            config.margins.top = parseInt(row.value) || 5;
            break;
          case "margin_bottom":
            config.margins.bottom = parseInt(row.value) || 5;
            break;
          case "margin_left":
            config.margins.left = parseInt(row.value) || 5;
            break;
          case "margin_right":
            config.margins.right = parseInt(row.value) || 5;
            break;
        }
      });
      
      return config;
    } catch (error) {
      console.error("Error getting printer config:", error);
      // Retornar configuración por defecto
      return {
        printerName: null,
        paperSize: "Letter",
        copies: 1,
        silent: false,
        color: false,
        margins: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5,
        },
      };
    }
  }

  /**
   * Imprime un ticket
   */
  async printTicket(saleData) {
    return new Promise((resolve, reject) => {
      try {
      // Crear ventana invisible para imprimir
        const printWindow = new BrowserWindow({
          width: 800,
          height: 600,
          show: false, // No mostrar la ventana
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
          },
        });

        const html = this.generateTicketHTML(saleData);

        // Cargar el HTML
        printWindow.loadURL(
          `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
        );

        // Cuando termine de cargar, imprimir
        printWindow.webContents.on("did-finish-load", () => {
          // Obtener configuración de impresora
          const printerConfig = this.getPrinterConfig();
          
          // Configuración de impresión
          const options = {
            silent: printerConfig.silent, // Usar configuración guardada
            printBackground: true,
            color: printerConfig.color,
            copies: printerConfig.copies,
            deviceName: printerConfig.printerName || undefined, // Usar impresora configurada
            margins: {
              marginType: "custom",
              top: printerConfig.margins.top,
              bottom: printerConfig.margins.bottom,
              left: printerConfig.margins.left,
              right: printerConfig.margins.right,
            },
          };
          
          // Configurar tamaño de papel
          if (printerConfig.paperSize === "58mm") {
            options.pageSize = {
              width: 58000,  // 58mm en microns
              height: 200000 // Alto suficiente
            };
          } else if (printerConfig.paperSize === "80mm") {
            options.pageSize = {
              width: 80000,  // 80mm en microns
              height: 200000
            };
          } else {
            // Tamaños estándar (Letter, A4, etc.)
            options.pageSize = printerConfig.paperSize;
          }

          printWindow.webContents.print(options, (success, failureReason) => {
            // Cerrar ventana después de imprimir
            printWindow.close();

            if (success) {
              console.log("✓ Ticket impreso exitosamente");
              resolve({ success: true });
            } else {
              console.error("✗ Error al imprimir:", failureReason);
              reject(new Error(failureReason || "Error al imprimir"));
            }
          });
        });

        // Manejar errores de carga
        printWindow.webContents.on("did-fail-load", () => {
          printWindow.close();
          reject(new Error("Error al cargar el ticket para imprimir"));
        });
      } catch (error) {
        console.error("Error printing ticket:", error);
        reject(error);
      }
    });
  }

  /**
   * Obtener lista de impresoras disponibles
   */
  async getPrinters() {
    try {
      const win = BrowserWindow.getFocusedWindow();
      if (win) {
        const printers = await win.webContents.getPrinters();
        return printers;
      }
      return [];
    } catch (error) {
      console.error("Error getting printers:", error);
      return [];
    }
  }
}

module.exports = new PrinterService();

