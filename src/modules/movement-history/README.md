# Módulo de Historial de Movimientos

Consulta avanzada de movimientos de inventario (entradas/salidas) con filtros por fecha, producto, tipo, referencia y generación de reportes PDF.

## 📁 Estructura

```
movement-history/
├── MovementsView.jsx          # Vista principal
├── hooks/
│   └── useMovements.js       # Hook para cargar y filtrar
├── components/
│   ├── FilterBar.jsx         # Barra de filtros
│   └── MovementsTable.jsx    # Tabla de resultados
└── README.md                 # Este archivo
```

## 🎯 Características

### Filtros Avanzados

- ✅ Búsqueda por nombre o código de barras de producto
- ✅ Filtro por folio/referencia (parcial)
- ✅ Filtro por tipo de movimiento: IN (Entrada) o OUT (Salida)
- ✅ Rango de fechas (inicio y fin)
- ✅ Límite configurable (default 200)

### Estadísticas en Tiempo Real

- Total de movimientos
- Cantidad de entradas y salidas
- Suma de cantidades IN/OUT

### Generación de PDF

- Exportación de listado filtrado
- Formato profesional con información de empresa
- Resumen estadístico incluido

## 🔄 Integración IPC

Handler usado: `inventory:getMovements`

**Filtros soportados:**

```javascript
{
  productQuery: "Coca",        // búsqueda en nombre/código
  reference: "ENT-001",         // folio/referencia parcial
  type: "IN",                   // 'IN' | 'OUT' | ''
  startDate: "2026-01-01",      // ISO string
  endDate: "2026-01-19",        // ISO string
  limit: 200
}
```

**Output:**

```javascript
[
  {
    id: 1,
    product_id: 5,
    product_name: "Coca Cola",
    product_barcode: "7501234567890",
    type: "IN",
    quantity: 10,
    reference: "ENT-001",
    user_id: 1,
    user_name: "Admin",
    created_at: "2026-01-19T12:00:00.000Z",
  },
];
```

## 📊 Generación de PDF

El botón **PDF** genera un reporte usando `reports:generatePDF` con `reportType = 'inventory-movements'`.

**Estructura del reporte:**

- Encabezado con información de empresa
- Período seleccionado
- Resumen estadístico
- Tabla detallada de movimientos con alternancia de colores
- Pie de página con fecha de generación

## 🚀 Uso

1. Navegar a `/movement-history` desde el Sidebar (grupo Historial)
2. Ajustar filtros según necesidad
3. Click en **Buscar** para aplicar filtros
4. Click en **Limpiar** para resetear
5. Click en **PDF** para exportar

## 📝 Notas

- La búsqueda es case-insensitive y usa `LIKE %query%`
- El límite predeterminado es 200 registros; ajustable en filtros
- Las fechas se comparan a nivel de día (DATE(created_at))
- Los movimientos se ordenan por fecha DESC (más recientes primero)
