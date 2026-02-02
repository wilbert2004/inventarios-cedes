# Módulo de Salida de Bienes

MVP (Mínimo Producto Viable) para registrar la salida/extracción de bienes y actualizar automáticamente el inventario.

## 📁 Estructura del Módulo

```
inventory-exit/
├── InventoryExitView.jsx          # Vista principal
├── hooks/
│   └── useSalesExit.js           # Lógica de negocio
├── components/
│   ├── ExitForm.jsx              # Formulario: folio, motivo, fecha, descripción
│   ├── ExitProductSearch.jsx     # Búsqueda de productos con stock
│   ├── ExitCart.jsx              # Carrito de productos a extraer
│   └── ExitSummaryPanel.jsx      # Resumen y botones de acción
└── README.md                      # Este archivo
```

## 🎯 Funcionalidades (MVP)

### ✅ Esenciales Implementadas

1. **Formulario de Salida**
   - **Folio** (requerido, único)
   - **Motivo** (requerido, dropdown con: TRASLADO, DEVOLUCIÓN, ROTURA, PÉRDIDA, TRANSFERENCIA, DONACIÓN, BAJA, OTRO)
   - **Fecha** (requerido, date picker)
   - **Descripción** (opcional)
   - Validación en tiempo real con mensajes de error

2. **Búsqueda de Bienes**
   - Busca por código de barras o nombre
   - Solo muestra bienes con disponibilidad
   - Dropdown interactivo con cantidad y valor
   - Selección rápida

3. **Carrito de Salida**
   - Múltiples bienes
   - Control de cantidad con validación (no puede exceder disponibilidad)
   - Muestra:
     - Disponibilidad actual
     - Cantidad a extraer
     - Disponibilidad después de la salida
     - Valor del bien
   - Eliminar bienes del carrito
   - Expandible/colapsable para vista rápida
   - Resumen rápido de totales

4. **Datos de Entrega/Recepción**
   - **Entregado por** (requerido)
   - **Recibido por** (requerido)
   - Importante para auditoría y responsabilidad

5. **Actualización Automática**
   - Crea registro en `asset_exits`
   - Actualiza stock en tabla `products` (decrementado)
   - Registra movimientos en `inventory_movements`
     - Tipo: `OUT`
     - Referencia: `EXIT:{folio}`
   - Transacción atómica (todo o nada)
   - Validación de stock disponible

6. **Resumen de Salida**
   - Total de productos a extraer
   - Cantidad total de unidades
   - Valor total estimado
   - Información del folio y motivo
   - Datos de entrega/recepción
   - Botones: Procesar / Cancelar

## 🔄 Flujo de Uso

```
1. Completar Formulario
   ↓
2. Buscar y Agregar Productos al Carrito
   ↓
3. Ajustar Cantidades según necesidad
   ↓
4. Completar Datos de Entrega/Recepción
   ↓
5. Procesar Salida
   ↓
6. Confirmación y Stock Actualizado
```

## 📊 Base de Datos

### Tablas Involucradas

#### `asset_exits`

Registro de salidas del inventario.

```sql
CREATE TABLE asset_exits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folio TEXT UNIQUE NOT NULL,
  exit_date TEXT NOT NULL,
  reason TEXT NOT NULL,
  delivered_by TEXT,
  received_by TEXT,
  description TEXT,
  user_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)
```

#### `products`

Actualización del campo `stock` (decrementado).

```sql
UPDATE products SET stock = stock - ? WHERE id = ?
```

#### `inventory_movements`

Registro de cada movimiento de salida.

```sql
INSERT INTO inventory_movements (product_id, type, quantity, reference, user_id)
VALUES (?, 'OUT', ?, 'EXIT:{folio}', ?)
```

## 🔐 Validaciones

1. **Folio debe ser único** - Validado a nivel de base de datos con `UNIQUE` constraint
2. **Todos los campos requeridos deben estar llenos** - Validación en el formulario
3. **Stock suficiente** - No permite extraer más de lo disponible
4. **Transacciones** - Si algo falla, todo se revierte (no hay cambios parciales)
5. **Datos de responsabilidad** - Requiere quién entrega y quién recibe

## 🎨 Componentes

### ExitForm

```jsx
<ExitForm ref={formRef} initialData={formData} onDataChange={setFormData} />
```

- Forwardref con métodos: `validate()` y `getData()`
- Manejo de errores con mensajes amigables
- Validación en tiempo real

### ExitProductSearch

```jsx
<ExitProductSearch
  products={products}
  onSelectProduct={handleSelect}
  isLoading={false}
/>
```

- Búsqueda dinámica por código/nombre
- Solo muestra productos con stock
- Dropdown interactivo

### ExitCart

```jsx
<ExitCart
  items={cartItems}
  products={products}
  onUpdateQuantity={updateQty}
  onRemoveItem={removeItem}
  isProcessing={false}
/>
```

- Carrito expandible
- Validación de cantidades
- Resumen visual de stock

### ExitSummaryPanel

```jsx
<ExitSummaryPanel
  totals={totals}
  formData={formData}
  cartItemsCount={count}
  onProcess={handleProcess}
  onCancel={handleCancel}
  isProcessing={false}
/>
```

- Resumen visual de la salida
- Validaciones finales
- Datos de entrega/recepción

## 🪝 Hook: useSalesExit

### Métodos Disponibles

```javascript
const {
  products, // Array de productos disponibles
  exitCart, // Items en el carrito
  totals, // { totalProducts, totalQuantity, estimatedValue }
  searchProduct, // Función de búsqueda
  addToExitCart, // Agregar producto
  updateQuantity, // Actualizar cantidad
  removeFromCart, // Eliminar producto
  processExit, // Procesar la salida (IPC)
  clearCart, // Vaciar carrito
} = useSalesExit();
```

### Payload para processExit

```javascript
{
  folio: "SAL-001",
  reason: "VENTA",
  exit_date: "2024-01-15",
  description: "Venta a cliente...",
  deliveredBy: "Juan Pérez",
  receivedBy: "María García",
  items: [
    { productId: 1, quantity: 5 },
    { productId: 2, quantity: 3 }
  ]
}
```

## 🔗 IPC Handler: inventory:productExit

Ubicación: `src/main/ipc/inventory.ipc.js`

### Responsabilidades

1. Crear registro en `asset_exits`
2. Validar folio único
3. Decrementar stock en `products`
4. Registrar movimientos en `inventory_movements`
5. Todo en una transacción

### Validaciones

- Folio debe ser único
- Productos deben existir
- Stock suficiente para cada producto
- Productos PRECIO_LIBRE no se pueden extraer

### Respuesta

```javascript
{
  success: true,
  folio: "SAL-001",
  exit: {
    exitId: 5,
    folio: "SAL-001",
    exit_date: "2024-01-15",
    reason: "VENTA",
    deliveredBy: "Juan",
    receivedBy: "María",
    exitsProcessed: [...],
    totalItems: 2,
    totalQuantity: 8,
    timestamp: "2024-01-15T10:30:00Z"
  }
}
```

## 🎯 Próximas Mejoras (Fase 4+)

- [ ] Recepción de salida (confirmación por quién recibe)
- [ ] Nota de salida imprimible
- [ ] Historial de salidas con filtros
- [ ] Devoluciones (reversión de salida)
- [ ] Integración con contabilidad
- [ ] Reportes de salidas por período
- [ ] Auditoría detallada

## 📝 Notas Técnicas

- **Transacciones**: Todas las operaciones usan `db.transaction()` para garantizar consistencia
- **Validación**: Cliente + Servidor (defensa en profundidad)
- **UI/UX**: Retroalimentación visual en tiempo real, toasts para confirmaciones
- **Acceso**: Solo administradores pueden acceder (verificado en Sidebar y app.jsx)

## 🐛 Debugging

Para verificar que los datos se guardaron correctamente:

```javascript
// En la consola principal:
const db = require("./src/main/db/connection");
console.log(db.prepare("SELECT * FROM asset_exits").all());
console.log(
  db.prepare('SELECT * FROM inventory_movements WHERE type = "OUT"').all(),
);
```
