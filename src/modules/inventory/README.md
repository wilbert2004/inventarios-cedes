# Módulo de Registro y Resguardo de Productos

Sistema de Gestión del Ciclo de Vida Completo de Productos en CEDES (Centro de Distribución y Resguardo).

**IMPORTANTE**: Este módulo NO maneja ventas ni stock comercial. Es un sistema de gestión de ciclo de vida con historial inmutable.

## 📁 Estructura del Módulo

```
inventory/
├── InventoryView.jsx          # Vista principal del módulo
├── ControlGeneralView.jsx     # Vista de Control General (relación histórica)
├── hooks/
│   └── (legacy - ya no se usa)
├── components/
│   └── (legacy - ya no se usan)
└── README.md                   # Este archivo
```

## 🎯 Características Principales

### 1. Vista Principal (InventoryView.jsx)

Dashboard interactivo con gestión del ciclo de vida de productos.

### 2. Vista de Control General (ControlGeneralView.jsx)

**Relación histórica completa** similar a un libro físico de control.

Características:

- ✅ Muestra TODOS los productos (activos y dados de baja)
- ✅ Solo consulta - NO permite edición
- ✅ Tabla con todas las columnas relevantes
- ✅ Búsqueda en tiempo real
- ✅ Estadísticas rápidas
- ❌ NO permite crear nuevos registros
- ❌ NO permite eliminar registros

Columnas incluidas:

- Fecha de registro
- Folio de referencia
- Centro de trabajo
- Descripción del equipo
- Cantidad
- Marca
- Modelo
- Número de inventario
- Número de serie
- Motivo
- Estado actual

### 3. Registro de Productos

- Número de inventario único (obligatorio)
- Número de serie único (opcional)
- Descripción completa
- Marca y modelo
- Cantidad
- Motivo: BAJA, RESGUARDO, TRASLADO
- Centro de origen
- Folio de referencia

### 2. Estados del Ciclo de Vida

```
EN_TRANSITO → EN_RESGUARDO → BAJA_DEFINITIVA
```

- **EN_TRANSITO**: Estado inicial al registrar. El producto está en camino al CEDES.
- **EN_RESGUARDO**: Producto recibido y bajo custodia del almacén. Requiere datos de recepción.
- **BAJA_DEFINITIVA**: Estado final. Producto dado de baja. Solo lectura.

### 3. Proceso de Entrega y Recepción

#### 1️⃣ ENTREGA (Obligatoria al registrar)

- Entregado por (centro de trabajo)
- Fecha de entrega

#### 2️⃣ RECEPCIÓN CHOFER (Opcional)

- Recibido por (chofer)
- Fecha de recepción chofer

#### 3️⃣ RECEPCIÓN ALMACÉN (Obligatoria para EN_RESGUARDO)

- Recibido por (almacén)
- Fecha de recepción almacén

### 4. Historial Inmutable

Cada producto tiene un registro de eventos que **NO puede editarse ni borrarse**:

Tipos de eventos:

- `registro`: Creación del producto
- `entrega`: Registro de entrega desde centro de trabajo
- `recepcion_chofer`: Recepción por transportista
- `recepcion_almacen`: Recepción en almacén CEDES
- `cambio_estado`: Cambio de estado del producto
- `baja`: Baja definitiva del producto
- `actualizacion`: Modificación de datos del producto

Cada evento incluye:

- Fecha y hora exacta
- Usuario responsable
- Descripción del evento
- Datos adicionales en JSON

### 5. Reglas de Negocio

✅ **Validaciones**:

- Número de inventario ÚNICO
- Número de serie ÚNICO (cuando existe)
- Estado inicial SIEMPRE es EN_TRANSITO
- NO se puede cambiar a EN_RESGUARDO sin datos de recepción en almacén
- NO se puede cambiar estado de un producto en BAJA_DEFINITIVA
- NO se permite eliminación física (soft delete)

❌ **Restricciones**:

- NO se puede editar número de inventario después de creación
- NO se puede regresar de BAJA_DEFINITIVA a otro estado
- NO se puede editar ni borrar historial de eventos

### 6. Estadísticas en Tiempo Real

- Total de productos
- Productos en tránsito
- Productos en resguardo
- Productos dados de baja
- Desglose por motivo (BAJA, RESGUARDO, TRASLADO)

### 7. Búsqueda y Filtros

- Búsqueda por número de inventario
- Búsqueda por descripción
- Búsqueda por número de serie
- Filtro por estado
- Filtro por motivo

## � Vista de Control General

### Descripción

La **Vista de Control General** es una relación histórica completa que replica un libro físico de control usado para auditorías y seguimiento.

### Características

✅ **Solo Consulta**:

- NO permite edición de registros
- NO permite creación de nuevos productos
- NO permite eliminación de registros
- Vista de solo lectura para auditoría

✅ **Datos Mostrados**:

- TODOS los productos (activos y dados de baja)
- Productos en cualquier estado
- Información completa de cada registro

### Columnas de la Tabla

| Columna                    | Descripción                                   | Campo en BD        |
| -------------------------- | --------------------------------------------- | ------------------ |
| **Fecha**                  | Fecha de registro del producto                | `created_at`       |
| **Folio**                  | Folio de referencia del documento             | `reference_folio`  |
| **Centro de Trabajo**      | Centro de origen del producto                 | `center_origin`    |
| **Descripción del Equipo** | Descripción completa                          | `description`      |
| **Cantidad**               | Número de unidades                            | `quantity`         |
| **Marca**                  | Marca del equipo                              | `brand`            |
| **Modelo**                 | Modelo del equipo                             | `model`            |
| **N° Inventario**          | Número único de inventario                    | `inventory_number` |
| **N° Serie**               | Número de serie único                         | `serial_number`    |
| **Motivo**                 | Motivo del registro (BAJA/RESGUARDO/TRASLADO) | `reason`           |
| **Estado Actual**          | Estado del producto                           | `product_status`   |

### Funcionalidades

1. **Búsqueda en Tiempo Real**
   - Busca en todos los campos relevantes
   - Filtrado instantáneo
   - Sin necesidad de presionar Enter

2. **Estadísticas Rápidas**
   - Total de registros
   - Productos en tránsito
   - Productos en resguardo
   - Productos dados de baja

3. **Visualización Clara**
   - Productos con BAJA_DEFINITIVA tienen opacidad reducida
   - Badges de color para estados
   - Badges de color para motivos
   - Formato de fecha localizado

4. **Totalizadores**
   - Total de registros mostrados
   - Suma de cantidades totales

### Acceso

**Ruta**: `/control-general`

**Ubicación en menú**: Principal → Control General

### Casos de Uso

1. **Auditoría**: Revisión completa de todos los productos registrados
2. **Inventario Físico**: Verificación contra registros digitales
3. **Seguimiento Histórico**: Consulta de productos dados de baja
4. **Reportes**: Base para generación de reportes PDF/Excel
5. **Conciliación**: Comparación con documentos físicos

### Diferencias con Vista Principal

| Aspecto       | Vista Principal      | Control General    |
| ------------- | -------------------- | ------------------ |
| **Propósito** | Gestión activa       | Consulta histórica |
| **Productos** | Filtrable por estado | Todos incluidos    |
| **Edición**   | Permitida            | NO permitida       |
| **Acciones**  | Múltiples botones    | Solo consulta      |
| **Enfoque**   | Operativo            | Auditoría          |

## �🔧 API Backend (custodyLifecycle)

### Métodos Disponibles

```javascript
// Registrar nuevo producto
await window.api.custodyLifecycle.register({
  inventory_number: "001-2025",
  serial_number: "ABC123",
  description: "Laptop HP",
  brand: "HP",
  model: "Pavilion",
  quantity: 1,
  reason: "RESGUARDO",
  center_origin: "Centro de Trabajo Norte",
  reference_folio: "FOL-001",
  entregado_por_centro_trabajo: "Juan Pérez",
  fecha_entrega: "2025-02-01",
  userId: 1,
});

// Registrar recepción por chofer
await window.api.custodyLifecycle.registerDriverReception({
  productId: 1,
  recibido_por_chofer: "Carlos López",
  fecha_recepcion_chofer: "2025-02-01",
  userId: 1,
});

// Registrar recepción en almacén
await window.api.custodyLifecycle.registerWarehouseReception({
  productId: 1,
  recibido_por_almacen: "María González",
  fecha_recepcion_almacen: "2025-02-01",
  userId: 1,
});

// Cambiar estado
await window.api.custodyLifecycle.changeStatus({
  productId: 1,
  newStatus: "EN_RESGUARDO",
  reason: "Producto recibido correctamente",
  userId: 1,
});

// Dar de baja
await window.api.custodyLifecycle.deactivate({
  productId: 1,
  motivo: "Producto obsoleto",
  userId: 1,
});

// Obtener historial
const history = await window.api.custodyLifecycle.getHistory(productId);

// Obtener estadísticas
const stats = await window.api.custodyLifecycle.getStatistics();

// Obtener productos con filtros
const products = await window.api.custodyLifecycle.getAll({
  status: "EN_RESGUARDO",
  reason: "RESGUARDO",
  search: "laptop",
});
```

## 📊 Estructura de Base de Datos

### Tabla: `custody_products`

```sql
CREATE TABLE custody_products (
  id INTEGER PRIMARY KEY,
  inventory_number TEXT UNIQUE NOT NULL,
  serial_number TEXT UNIQUE,
  description TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  quantity INTEGER DEFAULT 1,
  reason TEXT CHECK(reason IN ('BAJA','RESGUARDO','TRASLADO')),
  product_status TEXT CHECK(product_status IN ('EN_TRANSITO','EN_RESGUARDO','BAJA_DEFINITIVA')),
  reference_folio TEXT,
  center_origin TEXT,
  notes TEXT,
  entregado_por_centro_trabajo TEXT,
  fecha_entrega TEXT,
  recibido_por_chofer TEXT,
  fecha_recepcion_chofer TEXT,
  recibido_por_almacen TEXT,
  fecha_recepcion_almacen TEXT,
  fecha_baja TEXT,
  motivo_baja TEXT,
  registered_by INTEGER,
  is_deleted INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: `custody_product_history`

```sql
CREATE TABLE custody_product_history (
  id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  tipo_evento TEXT CHECK(tipo_evento IN ('registro','entrega','recepcion_chofer','recepcion_almacen','cambio_estado','baja','actualizacion')),
  descripcion TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  datos_json TEXT,
  changed_by INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 Flujo de Trabajo Completo

1. **Registro**: Se crea el producto con datos de ENTREGA → Estado: EN_TRANSITO
2. **Transporte**: (Opcional) Se registra recepción por chofer
3. **Llegada**: Se registra recepción en almacén
4. **Cambio a Resguardo**: Se cambia estado a EN_RESGUARDO (valida recepción almacén)
5. **Baja**: Cuando sea necesario, se cambia a BAJA_DEFINITIVA

### En Stock

- Verde: Stock > 10 unidades
- Badge verde: "En Stock"

### Stock Bajo

- Amarillo: Stock entre 1 y 10 unidades
- Badge amarillo: "Stock Bajo"

### Sin Stock

- Rojo: Stock = 0 unidades
- Badge rojo: "Sin Stock"

### Inactivo

- Gris: Producto desactivado (`active = 0`)
- Badge gris: "Inactivo"

## 🚀 API Utilizada

El módulo utiliza las siguientes APIs:

### `products:getAll`

Obtiene todos los productos con su información completa.

**Output:**

```javascript
[
  {
    id: 1,
    name: "Producto",
    barcode: "123456789",
    stock: 15,
    purchase_cost: 10.5,
    sale_price: 15.0,
    active: 1,
    // ...
  },
];
```

## 🔄 Flujo de Trabajo

1. **Cargar Inventario**
   - Al abrir la vista, se cargan todos los productos
   - Se calculan las estadísticas automáticamente

2. **Ver Alertas**
   - Si hay productos con stock bajo o sin stock, se muestran alertas
   - Las alertas son visibles en la parte superior

3. **Buscar Productos**
   - Escribir en el campo de búsqueda filtra productos en tiempo real
   - Puede buscar por nombre o código de barras

4. **Filtrar Stock Bajo**
   - Activar el checkbox muestra solo productos con stock ≤10
   - Útil para identificar productos que necesitan reposición

5. **Actualizar**
   - Click en "Actualizar" recarga los productos desde la base de datos
   - Útil después de realizar entradas o ventas

## 📝 Notas Técnicas

### Cálculo de Valor del Inventario

El valor se calcula usando el precio de compra, no el precio de venta:

```javascript
totalValue = products.reduce((sum, p) => sum + p.stock * p.purchase_cost, 0);
```

### Definición de Stock Bajo

Un producto tiene "stock bajo" si:

- Está activo (`active = 1`)
- Tiene stock mayor a 0
- Tiene stock menor o igual a 10

### Rendimiento

- La búsqueda y filtrado se hace en el cliente (no requiere llamadas al servidor)
- Las estadísticas se calculan una vez al cargar y se actualizan al refrescar

## 🔗 Integración con Otros Módulos

### Módulo de Productos

- Los productos se gestionan desde el módulo de Productos
- Los cambios se reflejan automáticamente al actualizar

### Módulo de Entrada de Productos

- Después de realizar una entrada, actualizar el inventario para ver los cambios
- El stock se actualiza automáticamente en la base de datos

### Módulo de Ventas

- Las ventas reducen el stock automáticamente
- Actualizar el inventario para ver el stock actualizado

## 🚧 Mejoras Futuras

- [ ] Exportar inventario a Excel/CSV
- [ ] Configurar umbral de stock bajo por producto
- [ ] Notificaciones automáticas de stock bajo
- [ ] Historial de movimientos de inventario integrado
- [ ] Gráficos de tendencias de stock
- [ ] Reportes de rotación de inventario
- [ ] Integración con proveedores para reorden automático
- [ ] Códigos QR para productos
- [ ] Filtros avanzados (por categoría, proveedor, etc.)
