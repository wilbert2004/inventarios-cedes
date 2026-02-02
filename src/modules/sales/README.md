# Módulo de Ventas (POS)

Sistema completo de punto de venta con gestión automática de inventario.

## 🎯 Características

### Funcionalidades Implementadas

✅ **Punto de Venta**
- Búsqueda de productos por código de barras o nombre
- Carrito de compras con actualización en tiempo real
- Control de cantidades con validación de stock
- Cálculo automático de totales
- Entrada de pago con botones rápidos
- Cálculo automático de cambio

✅ **Gestión de Inventario Automática**
- Descuento automático del stock al procesar venta
- Validación de stock disponible antes de agregar al carrito
- Verificación de stock al cambiar cantidades
- Registro de movimientos de inventario

✅ **Proceso de Venta Transaccional**
- Transacciones atómicas (todo o nada)
- Rollback automático en caso de error
- Validación de stock en el momento de la venta
- Registro completo en base de datos

✅ **Ticket de Venta**
- Generación de datos del ticket
- Número de ticket único
- Fecha y hora de la venta
- Detalle completo de items
- Botón para imprimir (preparado para impresora fiscal)

## 📋 Estructura de Base de Datos

### Tabla: `sales`
```sql
id                 INTEGER PRIMARY KEY
user_id            INTEGER NOT NULL
total              REAL NOT NULL
payment_method     TEXT NOT NULL
created_at         TEXT DEFAULT CURRENT_TIMESTAMP
```

### Tabla: `sale_items`
```sql
id                 INTEGER PRIMARY KEY
sale_id            INTEGER NOT NULL
product_id         INTEGER NOT NULL
quantity           INTEGER NOT NULL
unit_price         REAL NOT NULL
subtotal           REAL NOT NULL
```

### Tabla: `inventory_movements`
```sql
id                 INTEGER PRIMARY KEY
product_id         INTEGER NOT NULL
type               TEXT NOT NULL      -- IN | OUT
quantity           INTEGER NOT NULL
reference          TEXT               -- sale | purchase | adjustment
reference_id       INTEGER
user_id            INTEGER
created_at         TEXT DEFAULT CURRENT_TIMESTAMP
```

## 🔄 Flujo del Proceso de Venta

1. **Búsqueda de Productos**
   - El usuario escanea o busca productos
   - Se valida que el producto exista y esté activo
   - Se verifica que haya stock disponible

2. **Carrito de Compras**
   - Los productos se agregan al carrito
   - Se valida stock en cada actualización de cantidad
   - El usuario puede modificar cantidades o eliminar items

3. **Proceso de Pago**
   - El usuario ingresa el monto recibido
   - El sistema calcula automáticamente el cambio
   - Se valida que el pago sea suficiente

4. **Procesamiento de la Venta** (Transacción Atómica)
   ```javascript
   BEGIN TRANSACTION;
     1. Insertar registro en `sales`
     2. Insertar items en `sale_items`
     3. Actualizar stock en `products`
     4. Registrar movimientos en `inventory_movements`
   COMMIT;
   ```

5. **Ticket**
   - Se genera el ticket con todos los datos
   - Se muestra modal de éxito con resumen
   - Opción de imprimir el ticket

## 🚀 API (IPC Handlers)

### `sales:create`
Procesa una nueva venta completa.

**Input:**
```javascript
{
  userId: 1,
  total: 150.50,
  paymentMethod: 'cash',
  items: [
    {
      productId: 1,
      quantity: 2,
      unitPrice: 50.00
    },
    // ...más items
  ]
}
```

**Output:**
```javascript
{
  success: true,
  sale: {
    saleId: 1,
    saleInfo: { /* datos de la venta */ },
    items: [ /* items con detalles */ ],
    timestamp: '2024-01-03T12:00:00.000Z'
  }
}
```

**Errores:**
- `Stock insuficiente para [producto]`
- `Producto con ID [x] no encontrado`
- `Error al procesar la venta`

### `sales:getAll`
Obtiene todas las ventas con resumen.

**Output:**
```javascript
[
  {
    id: 1,
    user_id: 1,
    total: 150.50,
    payment_method: 'cash',
    created_at: '2024-01-03T12:00:00',
    items_count: 3
  },
  // ...más ventas
]
```

### `sales:getById`
Obtiene detalles completos de una venta.

**Input:** `saleId: number`

**Output:**
```javascript
{
  id: 1,
  user_id: 1,
  total: 150.50,
  payment_method: 'cash',
  created_at: '2024-01-03T12:00:00',
  items_count: 3,
  items: [
    {
      id: 1,
      sale_id: 1,
      product_id: 1,
      quantity: 2,
      unit_price: 50.00,
      subtotal: 100.00,
      product_name: 'Coca Cola 600ml',
      product_barcode: '7501234567890'
    },
    // ...más items
  ]
}
```

### `sales:reprintTicket`
Reimprime un ticket existente.

**Input:** `saleId: number`

**Output:** Similar a `sales:getById`

## 🎨 Componente de Ventas

### Props
No recibe props (componente standalone).

### Estados
- `cart`: Array de productos en el carrito
- `searchTerm`: Término de búsqueda actual
- `paymentAmount`: Monto ingresado por el cliente
- `products`: Lista de productos disponibles
- `loading`: Estado de carga de productos
- `isProcessing`: Estado de procesamiento de venta
- `showSuccessModal`: Muestra modal de éxito
- `showErrorModal`: Muestra modal de error
- `saleDetails`: Detalles de la venta completada

### Funciones Principales

#### `loadProducts()`
Carga todos los productos activos con stock disponible.

#### `handleSearch(e)`
Busca y agrega productos al carrito por código de barras o nombre.

#### `addToCart(product)`
Agrega un producto al carrito con validación de stock.

#### `updateQuantity(id, newQuantity)`
Actualiza la cantidad de un producto con validación de stock.

#### `handleCheckout()`
Procesa la venta completa:
- Valida el pago
- Envía datos al backend
- Actualiza el stock
- Muestra resultado

## 💡 Validaciones Implementadas

### Frontend
- ✅ Pago debe ser mayor o igual al total
- ✅ No se puede agregar más cantidad que el stock disponible
- ✅ El carrito debe tener al menos 1 producto
- ✅ Los productos deben estar activos

### Backend
- ✅ Verificación de existencia de productos
- ✅ Validación de stock en el momento de la venta
- ✅ Transacción atómica (rollback en caso de error)
- ✅ Validación de cantidades positivas

## 🖨️ Integración con Impresora

### Estado Actual
El sistema está preparado para impresora fiscal pero actualmente:
- Muestra alerta con información del ticket
- Registra en consola los datos para imprimir
- Placeholder para integración futura

### Para Integrar Impresora

1. **Instalar driver de la impresora**
```bash
npm install <driver-impresora-fiscal>
```

2. **Crear servicio de impresión**
```javascript
// src/main/services/printer.service.js
const printTicket = (saleData) => {
  // Implementar lógica de impresión
};
```

3. **Agregar handler IPC**
```javascript
ipcMain.handle('printer:printTicket', async (event, saleData) => {
  return await printTicket(saleData);
});
```

4. **Actualizar frontend**
```javascript
const handlePrint = async () => {
  await window.api.printer.printTicket(saleDetails);
};
```

## 🚧 Mejoras Futuras

- [ ] Múltiples métodos de pago (efectivo, tarjeta, transferencia)
- [ ] Descuentos y promociones
- [ ] Devoluciones y notas de crédito
- [ ] Impresión automática del ticket
- [ ] Cajón de dinero automático
- [ ] Búsqueda por categorías
- [ ] Ventas a crédito
- [ ] Impresión de tickets duplicados
- [ ] Reporte de ventas del día
- [ ] Historial de ventas por cliente

## 📝 Notas Técnicas

- El proceso de venta usa transacciones SQLite para garantizar consistencia
- El stock se actualiza inmediatamente al procesar la venta
- Los movimientos de inventario se registran automáticamente
- El campo `user_id` usa valor por defecto (1) hasta implementar autenticación
- El `payment_method` es fijo ('cash') hasta implementar múltiples métodos

## 🔐 Seguridad

- Las transacciones garantizan que no se pierda stock por ventas concurrentes
- Las validaciones frontend y backend evitan ventas sin stock
- Los rollbacks automáticos previenen inconsistencias en la base de datos

