# Módulo de Historial de Movimientos

Vista completa para consultar y administrar el historial de movimientos de bienes registrados.

## 📁 Estructura del Módulo

```
sales-history/
├── SalesHistoryView.jsx           # Vista principal (contenedor)
├── hooks/
│   └── useSalesHistory.js        # Custom hook con lógica de negocio
├── components/
│   ├── FilterBar.jsx             # Barra de búsqueda y filtros
│   ├── StatisticsCards.jsx       # Tarjetas de estadísticas
│   ├── SalesTable.jsx            # Tabla de ventas
│   └── SalesDetailModal.jsx      # Modal de detalles de venta
└── README.md                      # Este archivo
```

## 🎯 Características

### Estadísticas en Tiempo Real

- ✅ Total de ventas (cantidad)
- ✅ Ingresos totales ($)
- ✅ Artículos vendidos (cantidad)
- ✅ Ticket promedio ($)

### Búsqueda y Filtros

- ✅ Búsqueda por número de venta
- ✅ Búsqueda por total
- ✅ Filtro por fecha:
  - Todas las fechas
  - Hoy
  - Última semana
  - Último mes
- ✅ Botón de actualizar

### Tabla de Ventas

- ✅ Número de venta
- ✅ Fecha y hora
- ✅ Cantidad de artículos
- ✅ Total de la venta
- ✅ Método de pago (con badge de color)
- ✅ Acciones: Ver detalles y Reimprimir

### Modal de Detalles

- ✅ Información completa de la venta
- ✅ Lista detallada de productos vendidos
- ✅ Cantidades, precios unitarios y subtotales
- ✅ Códigos de barras de productos
- ✅ Botón para reimprimir ticket

## 🔧 Custom Hook: useSalesHistory

### Estados

```javascript
{
  sales,                // Array de ventas filtradas
  allSales,            // Array de todas las ventas
  loading,             // Boolean: cargando datos
  error,               // String: mensaje de error
  searchTerm,          // String: término de búsqueda
  dateFilter,          // String: filtro de fecha
  selectedSale,        // Object: venta seleccionada
  showDetailModal,     // Boolean: mostrar modal
  statistics,          // Object: estadísticas calculadas
}
```

### Funciones

```javascript
{
  loadSales,           // () => Promise<void>
  loadSaleDetails,     // (saleId: number) => Promise<void>
  reprintTicket,       // (saleId: number) => Promise<void>
  setSearchTerm,       // (term: string) => void
  setDateFilter,       // (filter: string) => void
  setShowDetailModal,  // (show: boolean) => void
}
```

### Estadísticas

```javascript
{
  totalSales: number,      // Cantidad de ventas
  totalRevenue: number,    // Ingresos totales
  totalItems: number,      // Items vendidos
  averageTicket: number,   // Ticket promedio
}
```

## 📊 Componentes

### FilterBar

Barra de búsqueda y filtros.

**Props:**

```javascript
{
  searchTerm: string,
  onSearchChange: (term: string) => void,
  dateFilter: string,
  onDateFilterChange: (filter: string) => void,
  onRefresh: () => void,
}
```

### StatisticsCards

Tarjetas de estadísticas con íconos de colores.

**Props:**

```javascript
{
  statistics: {
    totalSales: number,
    totalRevenue: number,
    totalItems: number,
    averageTicket: number,
  }
}
```

### SalesTable

Tabla completa de ventas con acciones.

**Props:**

```javascript
{
  sales: Array<Sale>,
  loading: boolean,
  onViewDetails: (saleId: number) => void,
  onReprint: (saleId: number) => void,
}
```

**Sale Type:**

```typescript
{
  id: number,
  user_id: number,
  total: number,
  payment_method: 'cash' | 'card' | 'transfer',
  created_at: string,
  items_count: number,
}
```

### SalesDetailModal

Modal con detalles completos de una venta.

**Props:**

```javascript
{
  isOpen: boolean,
  sale: SaleDetails | null,
  onClose: () => void,
  onReprint: (saleId: number) => void,
}
```

**SaleDetails Type:**

```typescript
{
  id: number,
  user_id: number,
  total: number,
  payment_method: string,
  created_at: string,
  items_count: number,
  items: Array<{
    id: number,
    sale_id: number,
    product_id: number,
    quantity: number,
    unit_price: number,
    subtotal: number,
    product_name: string,
    product_barcode: string | null,
  }>
}
```

## 🎨 Paleta de Colores

### Métodos de Pago

- **Efectivo**: Verde (`bg-green-100 text-green-800`)
- **Tarjeta**: Azul (`bg-blue-100 text-blue-800`)
- **Transferencia**: Morado (`bg-purple-100 text-purple-800`)

### Estadísticas

- **Total de Ventas**: Azul
- **Ingresos Totales**: Verde
- **Artículos Vendidos**: Morado
- **Ticket Promedio**: Naranja

## 🚀 Uso

```javascript
import SalesHistoryView from "./modules/sales-history/SalesHistoryView";

// En tu router
<Route path="/sales-history" element={<SalesHistoryView />} />;
```

## 📝 Flujo de Uso

1. **Vista Inicial**
   - Se cargan todas las ventas automáticamente
   - Se calculan y muestran las estadísticas
   - Se muestra la tabla completa

2. **Búsqueda**
   - El usuario escribe en el campo de búsqueda
   - Los resultados se filtran en tiempo real
   - Las estadísticas se actualizan automáticamente

3. **Filtro por Fecha**
   - El usuario selecciona un rango de fechas
   - La tabla se actualiza instantáneamente
   - Las estadísticas reflejan el filtro aplicado

4. **Ver Detalles**
   - Click en ícono de ojo
   - Se abre modal con detalles completos
   - Muestra productos, cantidades y precios

5. **Reimprimir Ticket**
   - Click en ícono de impresora
   - Se muestra alerta (placeholder para impresora)
   - Preparado para integración con impresora real

## 🔄 Integración con API

El hook utiliza las siguientes APIs:

- `window.api.sales.getAll()` - Obtener todas las ventas
- `window.api.sales.getById(id)` - Obtener detalles de una venta
- `window.api.sales.reprintTicket(id)` - Reimprimir ticket

## ✨ Buenas Prácticas Implementadas

1. **Separation of Concerns**
   - Hook para lógica
   - Componentes para UI
   - Vista principal solo integra

2. **Componentización**
   - Componentes pequeños y reutilizables
   - Cada componente tiene una responsabilidad única
   - Props bien definidos

3. **Performance**
   - Filtrado en memoria (eficiente para miles de registros)
   - useCallback para funciones costosas
   - Estadísticas calculadas una vez por render

4. **UX**
   - Estados de carga y error
   - Feedback visual inmediato
   - Animaciones suaves
   - Responsive design

5. **Mantenibilidad**
   - Código bien documentado
   - Estructura clara y organizada
   - Fácil de extender

## 🚧 Mejoras Futuras

- [ ] Exportar a Excel/PDF
- [ ] Gráficas de ventas
- [ ] Filtros avanzados (por usuario, rango de monto)
- [ ] Paginación para grandes volúmenes
- [ ] Comparativa entre períodos
- [ ] Ventas por categoría de producto
- [ ] Top productos más vendidos
- [ ] Anulación de ventas
- [ ] Notas de crédito

## 🔐 Seguridad

- Los datos se obtienen directamente de la base de datos
- No se expone información sensible
- Las operaciones de escritura (reimprimir) requieren confirmación

## 📱 Responsive

- **Mobile**: Tabla con scroll horizontal
- **Tablet**: Layout optimizado
- **Desktop**: Vista completa con todas las columnas
