# Módulo de Historial de Entradas

Vista completa para consultar y administrar el historial de entradas de bienes (recepción de mercancía).

## 📁 Estructura del Módulo

```
entry-history/
├── EntryHistoryView.jsx           # Vista principal (contenedor)
├── hooks/
│   └── useEntryHistory.js        # Custom hook con lógica de negocio
├── components/
│   ├── FilterBar.jsx             # Barra de búsqueda y filtros
│   ├── StatisticsCards.jsx        # Tarjetas de estadísticas
│   ├── EntriesTable.jsx          # Tabla de entradas
│   └── EntryDetailModal.jsx       # Modal de detalles de entrada
└── README.md                      # Este archivo
```

## 🎯 Características

### Estadísticas en Tiempo Real

- ✅ Total de entradas (cantidad)
- ✅ Bienes ingresados (cantidad)
- ✅ Cantidad total (unidades)
- ✅ Promedio de bienes por entrada

### Búsqueda y Filtros

- ✅ Búsqueda por ID de entrada
- ✅ Búsqueda por nombre de producto
- ✅ Búsqueda por código de barras
- ✅ Búsqueda por usuario
- ✅ Filtro por fecha:
  - Todas las fechas
  - Hoy
  - Última semana
  - Último mes
- ✅ Botón de actualizar

### Tabla de Entradas

- ✅ Número de entrada
- ✅ Fecha y hora
- ✅ Usuario que registró
- ✅ Cantidad de bienes
- ✅ Cantidad total ingresada
- ✅ Acción: Ver detalles

### Modal de Detalles

- ✅ Información completa de la entrada
- ✅ Lista detallada de bienes ingresados
- ✅ Cantidades por bien
- ✅ Códigos de barras de bienes
- ✅ Resumen total

## 🔧 Custom Hook: useEntryHistory

### Estados

```javascript
{
  entries,                // Array de entradas filtradas (agrupadas)
  allEntries,             // Array de todas las entradas sin filtrar
  loading,                // Estado de carga
  error,                  // Mensaje de error
  searchTerm,             // Término de búsqueda
  dateFilter,             // Filtro de fecha ('all', 'today', 'week', 'month')
  selectedEntry,          // Entrada seleccionada para ver detalles
  showDetailModal,        // Estado del modal de detalles
  statistics,             // Objeto con estadísticas calculadas
}
```

### Funciones

```javascript
{
  setSearchTerm,          // Actualizar término de búsqueda
  setDateFilter,          // Actualizar filtro de fecha
  loadMovements,          // Recargar movimientos desde la API
  loadEntryDetails,       // Cargar detalles de una entrada
  setShowDetailModal,     // Mostrar/ocultar modal de detalles
}
```

### Agrupación de Entradas

Las entradas se agrupan automáticamente por:

- **Timestamp** (redondeado a minutos)
- **Usuario** que registró la entrada

Esto permite que múltiples productos ingresados en la misma transacción aparezcan como una sola entrada en el historial.

## 📊 Componentes

### FilterBar

Barra de búsqueda y filtros para el historial.

**Props:**

```javascript
{
  searchTerm: string,
  onSearchChange: (value: string) => void,
  dateFilter: string,
  onDateFilterChange: (value: string) => void,
  onRefresh: () => void,
}
```

### StatisticsCards

Tarjetas con estadísticas del historial.

**Props:**

```javascript
{
  statistics: {
    totalEntries: number,
    totalProducts: number,
    totalQuantity: number,
    averageItemsPerEntry: number,
  }
}
```

### EntriesTable

Tabla que muestra todas las entradas.

**Props:**

```javascript
{
  entries: Array<Entry>,
  loading: boolean,
  onViewDetails: (entryId: number) => void,
}
```

**Entry Type:**

```typescript
{
  id: number,
  timestamp: string,
  userId: number,
  userName: string,
  items: Array<{
    id: number,
    productId: number,
    productName: string,
    productBarcode: string | null,
    quantity: number,
    type: string,
    reference: string,
    createdAt: string,
  }>,
  totalItems: number,
  totalQuantity: number,
}
```

### EntryDetailModal

Modal con detalles completos de una entrada.

**Props:**

```javascript
{
  isOpen: boolean,
  entry: Entry | null,
  onClose: () => void,
}
```

## 🎨 Paleta de Colores

### Estadísticas

- **Total de Entradas**: Azul
- **Bienes Ingresados**: Verde
- **Cantidad Total**: Morado
- **Promedio por Entrada**: Naranja

## 🚀 Uso

```javascript
import EntryHistoryView from "./modules/entry-history/EntryHistoryView";

// En tu router
<Route path="/entry-history" element={<EntryHistoryView />} />;
```

## 📝 Flujo de Uso

1. **Vista Inicial**
   - Se cargan todos los movimientos de entrada automáticamente
   - Se agrupan por entrada (timestamp + usuario)
   - Se calculan y muestran las estadísticas
   - Se muestra la tabla completa

2. **Búsqueda**
   - El usuario escribe en el campo de búsqueda
   - Los resultados se filtran en tiempo real
   - Busca en: ID, nombre de producto, código de barras, usuario
   - Las estadísticas se actualizan automáticamente

3. **Filtro por Fecha**
   - El usuario selecciona un rango de fechas
   - La tabla se actualiza instantáneamente
   - Las estadísticas reflejan el filtro aplicado

4. **Ver Detalles**
   - Click en ícono de ojo
   - Se abre modal con detalles completos
   - Muestra todos los productos de la entrada
   - Muestra cantidades y códigos de barras

## 🔄 Integración con API

El hook utiliza las siguientes APIs:

- `window.api.inventory.getMovements({ type: 'IN', reference: 'PRODUCT_ENTRY' })` - Obtener movimientos de entrada

## 📋 Notas Técnicas

### Agrupación de Movimientos

Los movimientos se agrupan por:

1. **Timestamp redondeado a minutos**: Movimientos registrados en el mismo minuto se consideran parte de la misma entrada
2. **Usuario**: Solo se agrupan movimientos del mismo usuario

Esto permite que cuando se registra una entrada con múltiples productos, todos aparezcan como una sola entrada en el historial.

### Límite de Registros

Por defecto, se obtienen hasta 1000 movimientos para agrupar. Si necesitas más, ajusta el parámetro `limit` en `useEntryHistory.js`.

## 🎯 Mejoras Futuras

- [ ] Exportar historial a Excel/PDF
- [ ] Filtro por producto específico
- [ ] Filtro por usuario
- [ ] Paginación para grandes volúmenes de datos
- [ ] Gráficos de tendencias de entradas
- [ ] Búsqueda avanzada con múltiples criterios
