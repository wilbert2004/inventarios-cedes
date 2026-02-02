# Módulo de Reportes de Ventas

Sistema completo de reportes y análisis de ventas con generación de PDFs y búsqueda de ventas específicas.

## 🎯 Características

### Funcionalidades Implementadas

✅ **Reportes por Período**

- Reporte Diario (últimas 24 horas)
- Reporte Semanal (últimos 7 días)
- Reporte Mensual (últimos 30 días)
- Reporte Anual (últimos 365 días)
- Filtros de fecha personalizados

✅ **Búsqueda de Ventas Específicas**

- Búsqueda por ID de venta
- Visualización detallada de productos vendidos
- Información completa del vendedor y método de pago
- Generación de comprobante individual

✅ **Análisis y Estadísticas**

- Total vendido en el período
- Cantidad de transacciones
- Ticket promedio
- Desglose por fecha
- Agrupación automática por día

✅ **Generación de PDFs**

- Exportación de reportes de período
- Comprobantes individuales de ventas
- Diseño profesional con tablas
- Guardado en ubicación elegida por el usuario

## 📋 Estructura de Base de Datos

### Consultas Utilizadas

#### Ventas por Rango de Fechas

```sql
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
```

#### Detalle de Venta Específica

```sql
-- Venta principal
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

-- Items de la venta
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
```

#### Estadísticas Diarias

```sql
SELECT
  DATE(s.created_at) as date,
  COUNT(s.id) as transaction_count,
  SUM(s.total) as total_sales,
  AVG(s.total) as average_transaction
FROM sales s
WHERE DATE(s.created_at) BETWEEN ? AND ?
GROUP BY DATE(s.created_at)
ORDER BY DATE(s.created_at) ASC
```

## 🔄 Flujo de Uso

### 1. Reportes por Período

1. **Selección de Tipo**
   - Usuario elige: Diario/Semanal/Mensual/Anual
   - Se calculan automáticamente las fechas

2. **Filtrado Opcional**
   - Usuario puede ajustar fechas manualmente
   - Sistema recalcula datos al cambiar fechas

3. **Visualización**
   - Tarjetas con estadísticas principales
   - Tabla con desglose por fecha
   - Panel de resumen

4. **Exportación**
   - Clic en "Descargar PDF"
   - Seleccionar ubicación
   - Sistema genera PDF con todos los datos

### 2. Venta Específica

1. **Búsqueda**
   - Usuario ingresa ID de venta
   - Sistema busca en base de datos

2. **Visualización**
   - Información del encabezado (fecha, vendedor, método)
   - Tabla detallada de productos
   - Cantidades, precios unitarios y subtotales
   - Total general

3. **Comprobante**
   - Clic en "Descargar PDF"
   - Sistema genera comprobante individual
   - Incluye todos los productos vendidos

## 🚀 API (IPC Handlers)

### `reports:getSalesByDateRange`

Obtiene todas las ventas en un rango de fechas.

**Input:**

```javascript
{
  startDate: '2026-01-01',  // ISO string
  endDate: '2026-01-05'     // ISO string
}
```

**Output:**

```javascript
[
  {
    id: 1,
    user_id: 1,
    total: 95.0,
    payment_method: "cash",
    created_at: "2026-01-05 12:30:45",
    user_name: "Juan Pérez",
    item_count: 3,
  },
  // ...más ventas
];
```

### `reports:getSaleDetail`

Obtiene detalles completos de una venta específica.

**Input:** `saleId: number`

**Output:**

```javascript
{
  id: 1,
  user_id: 1,
  total: 95.00,
  payment_method: 'cash',
  created_at: '2026-01-05 12:30:45',
  user_name: 'Juan Pérez',
  items: [
    {
      id: 1,
      product_id: 1,
      quantity: 2,
      unit_price: 30.00,
      subtotal: 60.00,
      product_name: 'Coca Cola 600ml'
    },
    // ...más items
  ]
}
```

**Errores:**

- `Sale ID es requerido`
- `Venta con ID [x] no encontrada`

### `reports:getDailyStats`

Obtiene estadísticas agrupadas por día.

**Input:**

```javascript
{
  startDate: '2026-01-01',
  endDate: '2026-01-05'
}
```

**Output:**

```javascript
[
  {
    date: "2026-01-05",
    transaction_count: 3,
    total_sales: 95.0,
    average_transaction: 31.67,
  },
  // ...más días
];
```

### `reports:getTopProducts`

Obtiene productos más vendidos en un período.

**Input:**

```javascript
{
  startDate: '2026-01-01',
  endDate: '2026-01-05',
  limit: 10  // opcional, default: 10
}
```

**Output:**

```javascript
[
  {
    id: 1,
    name: "Coca Cola 600ml",
    total_quantity: 25,
    total_revenue: 750.0,
    sold_in_transactions: 12,
  },
  // ...más productos
];
```

### `reports:generatePDF`

Genera y guarda un PDF del reporte.

**Input:**

```javascript
{
  reportData: {
    type: 'daily',  // daily | weekly | monthly | yearly | custom
    dateRange: {
      start: Date,
      end: Date
    },
    summary: {
      totalSales: 95.00,
      transactionCount: 3,
      averageTransaction: 31.67
    },
    sales: [...],      // Para reportes de período
    saleDetails: [...]  // Para venta específica (CUSTOM)
  },
  reportType: 'daily'
}
```

**Output:** `string` (ruta del archivo guardado) o `null` si se canceló

**Formatos:**

- **Reportes de Período**: Tabla de transacciones con resumen estadístico
- **Venta Específica**: Comprobante con tabla de productos

## 🎨 Componentes

### ReportsView

Componente principal que orquesta todo el módulo.

**Estados:**

- `chartData`: Datos procesados para la tabla
- `customSale`: Datos de venta específica encontrada

**Funciones principales:**

- `handleCustomSaleFound()`: Procesa venta encontrada
- `processDataForChart()`: Agrupa ventas por fecha
- `loadReportData()`: Carga datos del reporte seleccionado
- `handleDateFilterChange()`: Actualiza fechas y recarga
- `handleDownloadPDF()`: Genera y descarga PDF

### ReportSelector

Botones para seleccionar tipo de reporte.

**Props:**

- `currentType`: Tipo de reporte activo
- `onSelect`: Callback al seleccionar

**Tipos disponibles:**

- `DAILY`: Reporte Diario
- `WEEKLY`: Reporte Semanal
- `MONTHLY`: Reporte Mensual
- `YEARLY`: Reporte Anual
- `CUSTOM`: Venta Específica

### ReportFilters

Inputs de fecha para filtrar período.

**Props:**

- `dateRange`: `{ start: Date, end: Date }`
- `onDateChange`: Callback al cambiar fechas

**Características:**

- Manejo correcto de timezone (sin desfase UTC)
- Validación de fechas
- Formato YYYY-MM-DD

### ReportChart

Tabla que muestra datos agrupados por fecha.

**Props:**

- `data`: Array de datos procesados
- `reportType`: Tipo de reporte
- `loading`: Estado de carga

**Columnas:**

- Fecha
- Transacciones
- Total Ventas
- Promedio

### ReportPreview

Panel de resumen con estadísticas y botones.

**Props:**

- `report`: Datos del reporte
- `loading`: Estado de carga
- `onDownloadPDF`: Callback para descargar

**Tarjetas:**

- Total Vendido (verde)
- Transacciones (azul)
- Ticket Promedio (naranja)

### SaleSearchBar

Buscador de ventas específicas.

**Props:**

- `onSaleFound`: Callback cuando encuentra venta
- `loading`: Estado de carga

**Características:**

- Búsqueda por ID
- Soporte para Enter
- Manejo de errores
- Validación de input

## 📦 Hook Personalizado

### `useReports()`

**Estados:**

```javascript
{
  currentReportType: 'daily',     // Tipo actual
  reportData: { ... },            // Datos del reporte
  customDateRange: null,          // Fechas personalizadas
  loading: false,
  error: null
}
```

**Funciones:**

```javascript
{
  (getReport(type, dateRange), // Obtener reporte
    setCurrentReportType(type), // Cambiar tipo
    setCustomDateRange(range)); // Establecer fechas custom
}
```

**Lógica:**

- Calcula rango de fechas según tipo
- Ejecuta consultas IPC
- Procesa estadísticas
- Maneja errores

## 🔧 Constantes y Tipos

### `reportTypes.js`

**REPORT_TYPES:**

```javascript
{
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom'
}
```

**REPORT_TYPE_LABELS:**

```javascript
{
  daily: 'Reporte Diario',
  weekly: 'Reporte Semanal',
  monthly: 'Reporte Mensual',
  yearly: 'Reporte Anual',
  custom: 'Venta Específica'
}
```

**REPORT_DATE_RANGES:**

```javascript
{
  daily: 1,      // días
  weekly: 7,
  monthly: 30,
  yearly: 365,
  custom: 0      // sin rango fijo
}
```

## 🛠️ Dependencias

- **jsPDF** (2.5.2): Generación de documentos PDF
- **React**: UI y gestión de estado
- **Tailwind CSS**: Estilos
- **Electron IPC**: Comunicación con proceso principal
- **better-sqlite3**: Consultas de base de datos

## 📝 Notas Técnicas

### Manejo de Timezone

Las fechas se manejan sin conversión UTC para evitar desfase de días:

```javascript
// ❌ INCORRECTO: new Date('2026-01-05') → se interpreta como UTC
// ✅ CORRECTO: parse manual de componentes
const [year, month, day] = dateString.split("-");
const date = new Date(year, month - 1, day);
```

### Transacciones PDF

Los PDFs se generan en el proceso principal (acceso al sistema de archivos):

1. Usuario elige ubicación con `dialog.showSaveDialog()`
2. jsPDF genera el documento en memoria
3. Se guarda como buffer en la ruta elegida
4. Retorna ruta completa al frontend

### Procesamiento de Datos

Los datos de ventas se agrupan por fecha para visualización:

- Se extrae solo la fecha (sin hora)
- Se agrupan transacciones del mismo día
- Se calculan totales y promedios
- Se ordenan cronológicamente

## 🐛 Errores Comunes

**"no such column: p.sku"**

- Columna removida de consultas SQL
- Solución: No usar `p.sku` en queries

**"Fecha desfasada 1 día"**

- Problema de timezone UTC
- Solución: Parse manual de fechas

**"reportTypes no está definido"**

- Falta importar en main.js
- Solución: `require('./main/ipc/reports.ipc')`

## 🚀 Mejoras Futuras

- [ ] Gráficos visuales (líneas/barras)
- [ ] Exportación a Excel
- [ ] Comparación entre períodos
- [ ] Reportes por categoría de producto
- [ ] Reportes por vendedor
- [ ] Filtros avanzados (método de pago, rango de montos)
- [ ] Dashboard con KPIs
- [ ] Exportación programada
- [ ] Envío por email
