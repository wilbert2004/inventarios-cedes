# Módulo de Resguardo de Bienes (Custody Entry)

Módulo completo para el registro y control de **Resguardo de Bienes** en CEDES (Centro de Distribución y Resguardo) conforme a la estructura de documentos oficiales del gobierno.

## Características Principales

### 1. **Datos del Documento**

- Folio único y validado (formato: RSG-AAAA-###)
- Fecha de entrada del resguardo
- Validación de folio no duplicado en la BD

### 2. **Origen (Planta/Centro)**

- Nombre de la planta origen
- Código de identificación
- Dirección completa
- Municipio
- Zona/Sector

### 3. **Cadena de Custodia (3 Niveles)**

#### Quien Entrega

- Nombre completo
- Puesto/Cargo
- Campo de firma

#### Quien Transporta

- Nombre completo
- Número de Licencia/Credencial
- Campo de firma

#### Quien Recibe (en CEDES)

- Nombre completo
- Puesto/Cargo
- Campo de firma

### 4. **Bienes en Resguardo**

Agregar múltiples bienes con:

- **Número de Inventario** (ÚNICO)
- **Cantidad** (mínimo 1)
- **Descripción** (requerido)
- **Marca** (opcional)
- **Modelo** (opcional)
- **Número de Serie** (ÚNICO si se proporciona)
- **Razón**: Resguardo / Traslado / Baja
- **Condición Inicial**: Bueno / Dañado / Defectuoso
- **Notas** (observaciones adicionales)

### 5. **Carrito de Bienes**

- Visualización en tabla de todos los bienes agregados
- Estadísticas:
  - Total de bienes
  - Cantidad total de items
  - Cantidad en estado "Bueno"
  - Cantidad con daños
- Botón para eliminar bienes de la lista

### 6. **Panel de Resumen**

- Resumen de información general
- Datos de responsables
- Botón "Registrar Resguardo" (guardar en BD)
- Botón "Generar Comprobante" (PDF)
- Validación completa del formulario antes de guardar

### 7. **Comprobante en PDF**

Documento oficial con:

- Encabezado corporativo (CEDES, empresa)
- Datos del documento (folio, fecha, estado)
- Datos del origen
- Cadena de custodia con firmas
- Tabla detallada de bienes
- Totales y estadísticas
- Pie de página con información de generación

## Estructura de Archivos

```
custody-entry/
├── CustodyEntryView.jsx          # Vista principal
├── README.md                      # Este archivo
├── components/
│   ├── index.js                   # Exporta todos los componentes
│   ├── OriginForm.jsx             # Formulario del origen
│   ├── DocumentForm.jsx           # Folio y fecha
│   ├── AssetForm.jsx              # Agregar bien individual
│   ├── AssetCart.jsx              # Tabla de bienes agregados
│   ├── ResponsiblesForm.jsx       # Responsables (3 niveles)
│   └── SummaryPanel.jsx           # Resumen y acciones
├── hooks/
│   ├── index.js                   # Exporta los hooks
│   └── useCustodyEntry.js         # Lógica central del módulo
└── index.js                        # Exporta la vista principal
```

## Validaciones

### Validaciones de Entrada

- ✅ Folio es requerido y único
- ✅ Folio debe cumplir formato RSG-AAAA-###
- ✅ Número de inventario es requerido y único
- ✅ Número de serie es único (si se proporciona)
- ✅ Descripción del bien es requerida
- ✅ Cantidad debe ser ≥ 1
- ✅ Mínimo 1 bien debe ser agregado

### Validaciones de Responsables

- ✅ Nombre de quien entrega es requerido
- ✅ Cargo de quien entrega es requerido
- ✅ Nombre de quien transporta es requerido
- ✅ Nombre de quien recibe es requerido
- ✅ Cargo de quien recibe es requerido

### Validaciones de Origen

- ✅ Nombre de planta es requerido
- ✅ Municipio recomendado para trazabilidad

## Base de Datos

### Tablas Utilizadas

#### `custody_entries` (Encabezado)

```sql
- id (PRIMARY KEY)
- folio (UNIQUE, NOT NULL)
- origin_plant_name, origin_plant_code, origin_address
- origin_municipality, origin_zone
- entry_date
- delivered_by_name, delivered_by_position
- transported_by_name, transported_by_license
- received_by_name, received_by_position
- status (EN_RESGUARDO/DEVUELTO/BAJA/TRASLADO)
- created_at
```

#### `custody_items` (Detalle de Bienes)

```sql
- id (PRIMARY KEY)
- custody_entry_id (FOREIGN KEY)
- inventory_number (UNIQUE, NOT NULL)
- quantity, description, brand, model
- serial_number (UNIQUE)
- reason, status, initial_condition
- notes, created_at
```

#### `asset_location_history` (Trazabilidad)

```sql
- id (PRIMARY KEY)
- custody_item_id (FOREIGN KEY)
- location, status, moved_by_user_id
- moved_date, reason, created_at
```

## IPC Handlers

### Desde `custody.ipc.js`

```javascript
// Verificar si folio existe
await window.custody.checkFolioExists(folio);
// Retorna: { exists: boolean }

// Crear resguardo completo
await window.custody.createCustodyEntry(payload);
// Retorna: { success, folio, entryId, message }

// Obtener resguardo por ID
await window.custody.getCustodyEntry(entryId);
// Retorna: { success, data }

// Listar todos los resguardos (con filtros)
await window.custody.listCustodyEntries(filters);
// Retorna: { success, data, total }

// Cambiar estado
await window.custody.updateStatus(entryId, newStatus);
// Retorna: { success, message }

// Eliminar resguardo (solo si está EN_RESGUARDO)
await window.custody.deleteCustodyEntry(entryId);
// Retorna: { success, message }
```

### Desde `reports.ipc.js`

```javascript
// Generar comprobante PDF
await window.reports.generateCustodyVoucher(custodyId);
// Abre diálogo de guardado y crea PDF
```

## Estados del Resguardo

| Estado           | Descripción                      |
| ---------------- | -------------------------------- |
| **EN_RESGUARDO** | Bienes actualmente en CEDES      |
| **DEVUELTO**     | Bienes devueltos al origen       |
| **BAJA**         | Bienes dados de baja             |
| **TRASLADO**     | Bienes trasladados a otro centro |

## Flujo de Uso

1. **Iniciar Resguardo**
   - Ingresar folio (validado)
   - Seleccionar fecha
   - Ingresar datos del origen

2. **Definir Responsables**
   - Llenar 3 niveles de cadena de custodia
   - Nombres, cargos, posiciones

3. **Agregar Bienes**
   - Completar formulario de bien
   - Hacer clic en "+ Agregar Bien"
   - Repetir para múltiples bienes

4. **Revisar Resumen**
   - Verificar información en panel de resumen
   - Revisar lista de bienes
   - Validar totales

5. **Guardar**
   - Hacer clic "Registrar Resguardo"
   - Sistema valida y almacena
   - Se retorna entryId si es exitoso

6. **Generar Comprobante (Opcional)**
   - Hacer clic "Generar Comprobante"
   - Se abre diálogo para elegir ubicación
   - PDF se crea y abre

## Permisos

- **Solo Administrador** puede acceder al módulo
- Ruta protegida: `/custody-entry`
- Disponible en Sidebar → Administración → "Resguardo de Bienes"

## Estilos y UI

- Diseño responsive (mobile, tablet, desktop)
- Colores: Azul corporativo (#2563EB), Grises neutros
- Iconos: Lucide React
- Tailwind CSS para diseño
- Validaciones visuales (bordes rojo para errores)
- Mensajes de éxito/error auto-desplegables

## Próximas Mejoras

- [ ] Módulo de visualización de resguardos existentes
- [ ] Búsqueda y filtros avanzados
- [ ] Historial de movimientos de bienes
- [ ] Devoluciones parciales de resguardo
- [ ] Traslados entre CEDES
- [ ] Reportes consolidados de resguardo
- [ ] Firma digital electrónica
- [ ] Etiquetas QR para bienes
