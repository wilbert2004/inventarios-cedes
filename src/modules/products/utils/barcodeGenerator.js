import JsBarcode from 'jsbarcode';

/**
 * Utilidades para generar y descargar códigos de barras
 */

/**
 * Genera un código de barras EAN-13 automático basado en el ID del producto
 * @param {number} productId - ID del producto
 * @returns {string} Código de barras de 13 dígitos
 */
export function generateEAN13(productId) {
  // EAN-13 requiere 13 dígitos
  // Usamos el ID del producto y lo rellenamos con ceros
  // Formato: 7 (país México) + ID (hasta 10 dígitos) + dígito verificador
  const countryCode = '750'; // Código de país (México)
  const idString = productId.toString().padStart(9, '0');
  const codeWithoutCheck = countryCode + idString;
  
  // Calcular dígito verificador EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(codeWithoutCheck[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return codeWithoutCheck + checkDigit;
}

/**
 * Genera un código de barras único basado en timestamp y random
 * @returns {string} Código de barras de 13 dígitos
 */
export function generateUniqueBarcode() {
  // Generar código único usando timestamp y número aleatorio
  const timestamp = Date.now().toString().slice(-8); // Últimos 8 dígitos
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const countryCode = '750'; // México
  const codeWithoutCheck = countryCode + timestamp.slice(0, 5) + random;
  
  // Calcular dígito verificador EAN-13
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(codeWithoutCheck[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  
  return codeWithoutCheck + checkDigit;
}

/**
 * Genera el código de barras como imagen SVG/Canvas
 * @param {string} barcode - Código de barras a generar
 * @param {HTMLCanvasElement} canvas - Elemento canvas donde dibujar
 * @param {object} options - Opciones de configuración
 */
export function renderBarcode(barcode, canvas, options = {}) {
  if (!canvas || !barcode) {
    return false;
  }

  const defaultOptions = {
    format: 'EAN13',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 16,
    textMargin: 8,
    margin: 10,
    ...options,
  };

  try {
    // Limpiar canvas antes de renderizar
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Renderizar código de barras
    JsBarcode(canvas, barcode, defaultOptions);
    return true;
  } catch (error) {
    console.error('Error generando código de barras:', error);
    return false;
  }
}

/**
 * Descarga el código de barras como imagen PNG
 * @param {string} barcode - Código de barras
 * @param {string} filename - Nombre del archivo (sin extensión)
 */
export function downloadBarcodeAsImage(barcode, filename = 'barcode') {
  if (!barcode) {
    alert('No hay código de barras para descargar');
    return;
  }

  // Crear canvas temporal con dimensiones adecuadas
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 150;
  
  // Generar el código de barras en el canvas
  const success = renderBarcode(barcode, canvas, {
    format: barcode.length === 13 ? 'EAN13' : 'CODE128',
    width: 2,
    height: 120,
    displayValue: true,
    fontSize: 18,
    textMargin: 10,
    margin: 15,
  });

  if (!success) {
    alert('Error al generar el código de barras');
    return;
  }

  // Convertir canvas a blob y descargar
  canvas.toBlob((blob) => {
    if (!blob) {
      alert('Error al generar la imagen');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Limpiar nombre de archivo de caracteres inválidos
    const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeFilename}_${barcode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}
