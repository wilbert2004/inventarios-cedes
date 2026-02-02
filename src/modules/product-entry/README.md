# Módulo de Entrada de Bienes

MVP (Mínimo Producto Viable) para registrar la recepción de bienes y actualizar el inventario automáticamente.

## 📁 Estructura del Módulo

```
product-entry/
├── ProductEntryView.jsx           # Vista principal
├── hooks/
│   └── useProductEntry.js        # Lógica de negocio
├── components/
│   ├── ProductSearchBar.jsx      # Búsqueda con cantidad
   ├── EntryCart.jsx             # Carrito de bienes a ingresar
│   └── SummaryPanel.jsx          # Resumen y botones de acción
└── README.md                      # Este archivo
```

## 🎯 Funcionalidades (MVP)

### ✅ Esenciales Implementadas

1. **Búsqueda Rápida**
   - Campo para escanear código de barras
   - Búsqueda por nombre
   - Campo de cantidad integrado
   - Auto-focus para escaneo continuo

2. **Carrito de Entrada**
   - Múltiples bienes a la vez
   - Control de cantidad (botones +/- o input directo)
   - Muestra inventario actual → inventario nuevo
   - Eliminar bienes del carrito

3. **Actualización Automática**
   - Actualiza inventario en tabla `custody_products`
   - Registra movimientos en `inventory_movements`
   - Tipo: `IN`
   - Referencia: `PRODUCT_ENTRY`
   - Transacción atómica (todo o nada)

4. **Resumen**
   - Total de bienes a ingresar
   - Cantidad total de unidades
   - Valor estimado del inventario

5. **Confirmación**
   - Modal de éxito con resumen
   - Fecha y hora del registro
   - Limpiar carrito automático

## 📊 Base de Datos

### Tabla: `inventory_movements`

```sql
product_id    INTEGER NOT NULL
type          TEXT NOT NULL         -- "IN"
quantity      INTEGER NOT NULL
reference     TEXT                  -- "PRODUCT_ENTRY"
user_id       INTEGER
created_at    TEXT
```

### Actualización de Stock

```sql
UPDATE products
SET stock = stock + [cantidad]
WHERE id = [product_id]
```

## 🔄 Flujo de Trabajo

1. **Escanear/Buscar Producto**
   - Usuario escanea código de barras o busca por nombre
   - Ingresa cantidad (default: 1)
   - Click en "Agregar"

2. **Agregar al Carrito**
   - Producto se agrega con cantidad especificada
   - Muestra: Stock actual → Stock nuevo
   - Permite modificar cantidad o eliminar

3. **Agregar Más Productos**
   - Continúa escaneando productos
   - El cursor vuelve automáticamente al campo de búsqueda
   - Puede agregar múltiples productos diferentes

4. **Revisar Resumen**
   - Total de productos distintos
   - Cantidad total de unidades
   - Valor estimado (basado en costo de compra)

5. **Registrar Entrada**
   - Click en "Registrar Entrada"
   - Proceso transaccional:
     - Actualiza stock de todos los productos
     - Registra movimientos en inventory_movements
     - Todo se confirma o todo se revierte
   - Modal de éxito
   - Carrito se limpia automáticamente

## 🚀 API (IPC Handlers)

### `inventory:productEntry`

Procesa la entrada de múltiples productos.

**Input:**

```javascript
{
  userId: 1,
  items: [
    {
      productId: 1,
      productName: "Coca Cola 600ml",
      quantity: 24
    },
    {
      productId: 2,
      productName: "Pan Blanco",
      quantity: 50
    }
  ]
}
```

**Output:**

```javascript
{
  success: true,
  entry: {
    entriesProcessed: [
      {
        movementId: 123,
        productId: 1,
        productName: "Coca Cola 600ml",
        quantity: 24
      },
      // ...
    ],
    totalItems: 2,
    totalQuantity: 74,
    timestamp: "2024-01-03T19:30:00.000Z"
  }
}
```

### `inventory:getMovements`

Obtiene historial de movimientos (futuro).

**Input:** `filters` (opcional)

```javascript
{
  type: "IN",              // Filtrar por tipo
  productId: 1,            // Filtrar por producto
  reference: "PRODUCT_ENTRY",  // Filtrar por referencia
  limit: 100               // Límite de resultados
}
```

## 🧩 Componentes

### ProductSearchBar

Barra de búsqueda con campo de cantidad integrado.

**Props:**

```javascript
{
  onProductFound: (searchTerm: string, quantity: number) => void
}
```

**Características:**

- ✅ Campo de búsqueda con ícono de código de barras
- ✅ Campo de cantidad numérica
- ✅ Botón "Agregar" verde
- ✅ Auto-focus para escaneo rápido
- ✅ Submit con Enter

### EntryCart

Lista de productos a ingresar.

**Props:**

```javascript
{
  items: Array<Product & { quantity: number }>,
  onUpdateQuantity: (productId: number, quantity: number) => void,
  onRemove: (productId: number) => void
}
```

**Características:**

- ✅ Muestra stock actual y stock después de entrada
- ✅ Control de cantidad: botones +/- o input directo
- ✅ Botón de eliminar por producto
- ✅ Estado vacío con mensaje
- ✅ Scroll automático si hay muchos productos

### SummaryPanel

Panel de resumen y acciones.

**Props:**

```javascript
{
  totals: {
    totalProducts: number,
    totalQuantity: number,
    estimatedValue: number
  },
  onProcess: () => void,
  onCancel: () => void,
  processing: boolean,
  disabled: boolean
}
```

**Características:**

- ✅ Resumen de la entrada
- ✅ Valor estimado del inventario entrante
- ✅ Botón "Registrar Entrada" (verde)
- ✅ Botón "Cancelar" (rojo)
- ✅ Estados disabled y loading

## 🎨 UX/UI

### Colores

- **Verde**: Entrada de productos (positivo, aumenta stock)
- **Gris**: Información neutral
- **Rojo**: Cancelar o eliminar

### Estados

- ✅ Loading mientras carga productos
- ✅ Carrito vacío con mensaje guía
- ✅ Error si producto no existe
- ✅ Success con resumen completo
- ✅ Processing con spinner

### Responsive

- ✅ Mobile: Layout vertical
- ✅ Desktop: Layout con sidebar de resumen
- ✅ Tabla con scroll horizontal si es necesario

## 🔧 Custom Hook: useProductEntry

### Estados

```javascript
{
  products,          // Array de productos disponibles
  entryCart,         // Array de productos a ingresar
  searchTerm,        // Término de búsqueda
  loading,           // Cargando productos
  processing,        // Procesando entrada
  error,             // Mensaje de error
  totals: {          // Totales calculados
    totalProducts,
    totalQuantity,
    estimatedValue
  }
}
```

### Funciones

```javascript
{
  searchProduct,     // (term: string) => Product | null
  addToEntryCart,    // (product, quantity) => void
  updateQuantity,    // (productId, quantity) => void
  removeFromCart,    // (productId) => void
  processEntry,      // (userId) => Promise<Result>
  clearCart,         // () => void
  refreshProducts,   // () => Promise<void>
}
```

## 🎯 Casos de Uso

### Caso 1: Llegó un proveedor con mercancía

1. Ve a "Entrada de Productos"
2. Escanea el código de barras del primer producto
3. Ingresa la cantidad recibida
4. Click "Agregar"
5. Repite para cada producto
6. Revisa el resumen
7. Click "Registrar Entrada"
8. ¡Stock actualizado automáticamente!

### Caso 2: Entrada rápida de un solo producto

1. Escanea código
2. Escribe cantidad
3. Enter (submit)
4. Click "Registrar Entrada"
5. Listo

### Caso 3: Corrección de inventario

1. Busca el producto por nombre
2. Ingresa la cantidad a aumentar
3. Agrega más productos si es necesario
4. Registra la entrada

## 📝 Registro en Base de Datos

Para cada producto ingresado se crea:

```sql
INSERT INTO inventory_movements (
  product_id,
  type,
  quantity,
  reference,
  user_id,
  created_at
) VALUES (
  1,
  'IN',
  24,
  'PRODUCT_ENTRY',
  1,
  CURRENT_TIMESTAMP
);

UPDATE products
SET stock = stock + 24
WHERE id = 1;
```

## 🔒 Seguridad

- ✅ Transacción atómica (rollback automático si falla)
- ✅ Validación de cantidades positivas
- ✅ Registro del usuario que hace la entrada
- ✅ Timestamp automático
- ✅ Auditoría completa en inventory_movements

## 🚧 Mejoras Futuras (No MVP)

- [ ] Imprimir comprobante de entrada
- [ ] Entrada con referencia a orden de compra
- [ ] Entrada con factura del proveedor
- [ ] Costo de compra por entrada (diferente al registrado)
- [ ] Lector de código de barras USB automático
- [ ] Notas en la entrada
- [ ] Entrada por categoría
- [ ] Vista previa antes de confirmar
- [ ] Exportar reporte de entrada

## 🎉 Uso

```jsx
// Ruta agregada
<Route path="/product-entry" element={<ProductEntryView />} />

// Sidebar actualizado con link "Entrada de Productos"
```

## ✅ Checklist de Funcionalidades MVP

- [x] Buscar producto por código de barras
- [x] Buscar producto por nombre
- [x] Especificar cantidad al agregar
- [x] Agregar múltiples productos
- [x] Modificar cantidades
- [x] Eliminar productos del carrito
- [x] Ver resumen antes de confirmar
- [x] Actualizar stock automáticamente
- [x] Registrar en inventory_movements
- [x] Tipo: IN
- [x] Referencia: PRODUCT_ENTRY
- [x] Usuario que registra
- [x] Timestamp automático
- [x] Transacción atómica
- [x] Modal de confirmación
- [x] Limpieza automática del carrito

**¡MVP Completo y Funcional!** ✅
