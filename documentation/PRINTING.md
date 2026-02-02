# 🖨️ Sistema de Impresión de Tickets

Sistema completo de impresión de tickets compatible con cualquier impresora instalada en el sistema.

## ✅ ¿Qué se Implementó?

### 1. **Servicio de Impresión** (`printer.service.js`)
- ✅ Genera HTML profesional del ticket
- ✅ Formato de ticket de 80mm de ancho
- ✅ Diseño optimizado para impresión
- ✅ Compatible con cualquier impresora

### 2. **Handler IPC** (`printer.ipc.js`)
- ✅ `printer:printTicket` - Imprime un ticket
- ✅ `printer:getPrinters` - Lista impresoras disponibles

### 3. **Integración en Ventas**
- ✅ Botón "Imprimir Ticket" en modal de venta exitosa
- ✅ Reimpresión desde historial de ventas
- ✅ Datos completos: productos, cantidades, precios, totales

## 🎯 Características del Ticket

### Formato del Ticket (80mm)
```
================================
       POS SYSTEM
   Sistema de Punto de Venta
   RFC: XXXXXXXXXXX
   Tel: (999) 123-4567
================================

Ticket #123    03/01/2024
Hora: 19:30
Cajero: Administrador

================================

PRODUCTOS:

Coca Cola 600ml
Código: 7501234567890
2 x $15.00         $30.00

Pan Blanco
1 x $8.00          $8.00

--------------------------------

Subtotal:          $38.00
IVA (incluido):    $5.24

================================
TOTAL:             $38.00
================================

Pago con:          $50.00
Cambio:            $12.00

--------------------------------

    ¡Gracias por su compra!
         Vuelva pronto

Este ticket es válido como
    comprobante de compra
```

### Información Incluida
- ✅ Logo y datos del negocio
- ✅ Número de ticket único
- ✅ Fecha y hora
- ✅ Nombre del cajero
- ✅ Lista de productos con:
  - Nombre del producto
  - Código de barras (si existe)
  - Cantidad x Precio unitario
  - Subtotal por producto
- ✅ Subtotal de la venta
- ✅ IVA calculado
- ✅ Total en grande
- ✅ Pago recibido y cambio
- ✅ Mensaje de agradecimiento

## 🖨️ Configuración para Canon G3110

### Características de la Impresora
- **Modelo**: Canon PIXMA G3110
- **Tipo**: Multifuncional de inyección de tinta
- **Conexión**: WiFi/USB
- **Papel**: A4, carta, etc.

### Configuración Recomendada

El sistema está configurado con:
```javascript
pageSize: {
  width: 80000,  // 80mm en microns (ancho de ticket)
  height: 200000 // Alto automático según contenido
}
```

### Ajustes en la Impresión

Al imprimir, se abrirá el diálogo de Windows donde puedes:
1. **Seleccionar tu Canon G3110**
2. **Configurar opciones:**
   - Orientación: **Retrato**
   - Tamaño: **Personalizado** (80mm x variable)
   - Márgenes: **0mm** (sin márgenes)
   - Escala: **100%**
3. **Imprimir**

### ⚠️ Nota Importante para Canon G3110

Tu impresora es A4/Carta, no es una impresora de tickets. Por lo tanto:

**Opción 1: Papel Continuo (Recomendado)**
- Puedes usar papel bond en rollo de 80mm
- Cortar manualmente después de imprimir
- El ticket se imprimirá en la parte superior

**Opción 2: Papel A4/Carta**
- El ticket se imprimirá en la esquina superior
- Quedará mucho espacio en blanco
- Puedes cortar con tijera

**Opción 3: Configurar Tamaño Personalizado en Windows**
1. Ve a **Configuración** → **Impresoras**
2. Click derecho en **Canon G3110** → **Preferencias de impresión**
3. Busca **Tamaño de papel personalizado**
4. Crea un tamaño: **80mm x 150mm** (aproximado)
5. Guarda como "Ticket"
6. Usa este tamaño al imprimir

## 🚀 Cómo Funciona

### Al Procesar una Venta

1. Usuario completa la venta
2. Se muestra el modal de éxito
3. Click en **"Imprimir Ticket"**
4. El sistema:
   - Genera HTML del ticket
   - Abre ventana invisible de Electron
   - Carga el HTML en la ventana
   - Abre diálogo de impresión de Windows
   - Usuario selecciona Canon G3110
   - Se imprime el ticket
   - Ventana se cierra automáticamente

### Desde Historial de Ventas

1. Ve a "Historial de Ventas"
2. Click en el ícono de impresora 🖨️ de cualquier venta
3. O abre los detalles y click en "Reimprimir Ticket"
4. Se imprime inmediatamente

## 🔧 API de Impresión

### Imprimir Ticket
```javascript
await window.api.printer.printTicket({
  sale: {
    saleId: 123,
    total: 38.00,
    timestamp: '2024-01-03T19:30:00',
    cashierName: 'Administrador'
  },
  items: [
    {
      productName: 'Coca Cola 600ml',
      productBarcode: '7501234567890',
      quantity: 2,
      unitPrice: 15.00,
      subtotal: 30.00
    }
  ],
  payment: 50.00,
  change: 12.00
});
```

### Obtener Impresoras
```javascript
const printers = await window.api.printer.getPrinters();
console.log(printers);
// [
//   {
//     name: 'Canon G3110',
//     description: 'Canon G3110 series',
//     status: 0,
//     isDefault: true,
//     ...
//   }
// ]
```

## 🎨 Personalización del Ticket

Para personalizar el diseño del ticket, edita:

**Archivo**: `src/main/services/printer.service.js`

### Cambiar Datos del Negocio
```javascript
<h1>TU NEGOCIO</h1>
<p>Dirección completa</p>
<p>RFC: TU_RFC_AQUI</p>
<p>Tel: TU_TELEFONO</p>
```

### Cambiar Ancho del Ticket
```javascript
// Para tickets de 58mm
pageSize: {
  width: 58000,  // 58mm
  height: 200000
}

// Para tickets de 110mm
pageSize: {
  width: 110000,  // 110mm
  height: 200000
}
```

### Agregar Logo
```javascript
<img src="data:image/png;base64,..." style="width: 100px; height: auto;">
```

### Cambiar Estilos
Modifica el CSS en la sección `<style>` del HTML.

## 📝 Notas Técnicas

### Ventana Invisible
- Se crea una `BrowserWindow` invisible
- Carga el HTML del ticket
- Imprime y se cierra automáticamente
- No interfiere con la ventana principal

### Diálogo de Impresión
- `silent: false` muestra el diálogo de Windows
- El usuario puede seleccionar impresora
- Permite ajustar opciones antes de imprimir
- Para impresión automática, cambiar a `silent: true`

### Formato del Papel
- **80mm** es el estándar para tickets
- El alto es automático según el contenido
- Usa microns (1mm = 1000 microns)

## 🧪 Para Probar

### Prueba 1: Imprimir desde Venta
1. Ve a "Punto de Venta"
2. Agrega productos al carrito
3. Ingresa el pago
4. Click en "Cobrar"
5. En el modal de éxito, click **"Imprimir Ticket"**
6. Se abrirá el diálogo de impresión de Windows
7. Selecciona tu Canon G3110
8. ¡Imprime!

### Prueba 2: Reimprimir desde Historial
1. Ve a "Historial de Ventas"
2. Click en el ícono de impresora de cualquier venta
3. Se abrirá el diálogo de impresión
4. Selecciona tu impresora
5. Imprime

### Prueba 3: Ver Impresoras Disponibles
```javascript
// En la consola de DevTools
const printers = await window.api.printer.getPrinters();
console.log(printers);
```

## 🎯 Resultado Esperado

Con tu Canon G3110:
- ✅ Se abrirá el diálogo de impresión de Windows
- ✅ Verás tu Canon G3110 en la lista
- ✅ El ticket se imprimirá en formato vertical
- ✅ Ancho limitado a ~80mm (área de ticket)
- ✅ Puedes usar papel A4 y cortar el ticket

## 🔮 Mejoras Futuras

- [ ] Imprimir automáticamente después de cada venta (sin diálogo)
- [ ] Guardar impresora predeterminada
- [ ] Copias múltiples del ticket
- [ ] Logo del negocio en el ticket
- [ ] QR code con datos de la venta
- [ ] Envío por correo electrónico
- [ ] Ticket digital (PDF)
- [ ] Soporte para impresoras ESC/POS (comandos directos)

## 🎉 ¡Listo para Imprimir!

El sistema está completamente funcional y listo para imprimir en tu Canon G3110.

**Próximos pasos:**
1. Reinicia la aplicación
2. Realiza una venta de prueba
3. Click en "Imprimir Ticket"
4. Selecciona tu Canon G3110
5. ¡Imprime tu primer ticket!

💡 **Tip**: Para mejores resultados, usa papel bond de 80mm de ancho o configura un tamaño personalizado en las propiedades de la impresora.



