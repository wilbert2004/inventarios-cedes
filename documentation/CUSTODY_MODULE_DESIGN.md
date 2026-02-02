# Análisis y Recomendaciones: Módulo de Resguardo en CEDES

## 📄 Documento de Referencia Analizado

El documento oficial muestra un "FORMATO DE RECOLECCIÓN DE BIENES DE BAJA" con estructura clara que incluye:

- Folio único
- Datos del origen (plantel, clave, domicilio)
- Datos del bien (cantidad, inventario, descripción, marca, modelo, serie)
- Responsables (entrega, transporte, recepción)
- Firma de municipio y zona

---

## 🔴 **PROBLEMAS ACTUALES DEL MÓDULO**

### 1. **Enfoque Incorrecto**

- ❌ Módulo actual es para **"Entrada de Compra"** (recepción de mercancía)
- ❌ Usa tabla `products` (para venta)
- ❌ Actualiza stock automáticamente (no aplica aquí)
- ❌ No tiene datos de origen/responsables detallados

### 2. **Falta de Trazabilidad**

- ❌ No captura datos de quién entrega
- ❌ No captura quién transporta
- ❌ No captura quién recibe
- ❌ No hay estado de "RESGUARDO"

### 3. **Falta de Información del Bien**

- ❌ No captura: marca, modelo, serie, número de inventario
- ❌ No captura: motivo (baja, resguardo, traslado)
- ❌ No captura: datos del origen detallados

### 4. **Falta de Validaciones**

- ❌ Folio no está forzado a ser único en UI
- ❌ No hay validación de campos específicos del bien

---

## 🟢 **RECOMENDACIONES DE MEJORA**

### **Opción A: Crear nuevo módulo específico (Recomendado)**

**Crear:** `/src/modules/custody-entry/` (Entrada de Resguardo)

**Razón:**

- El flujo es completamente diferente al de compra
- Usa tabla `assets` (no `products`)
- No maneja stock
- Estados diferentes
- Documentación oficial diferente

**Estructura:**

```
custody-entry/
├── CustodyEntryView.jsx          # Vista principal
├── hooks/
│   └── useCustodyEntry.js       # Lógica de resguardo
├── components/
│   ├── OriginForm.jsx            # Datos del centro de trabajo
│   ├── DocumentForm.jsx          # Folio, fecha, municipio, zona
│   ├── AssetForm.jsx             # Datos del bien (detallado)
│   ├── AssetCart.jsx             # Carrito de bienes
│   ├── ResponsiblesForm.jsx      # Entrega, transporte, recepción
│   └── SummaryPanel.jsx          # Resumen y confirmación
└── README.md
```

---

## 🗄️ **CAMBIOS EN BASE DE DATOS NECESARIOS**

### **Nueva Tabla: `custody_entries` (Reemplaza/Complementa `asset_entries`)**

```sql
CREATE TABLE IF NOT EXISTS custody_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  folio TEXT UNIQUE NOT NULL,

  -- Datos del origen
  origin_plant_name TEXT NOT NULL,
  origin_plant_code TEXT,
  origin_address TEXT,
  origin_municipality TEXT,
  origin_zone TEXT,

  -- Datos del documento
  entry_date TEXT NOT NULL,

  -- Responsables
  delivered_by_name TEXT NOT NULL,     -- Quién entrega (centro de trabajo)
  delivered_by_position TEXT,
  transported_by_name TEXT NOT NULL,    -- Quién transporta (chofer)
  transported_by_license TEXT,
  received_by_name TEXT NOT NULL,       -- Quién recibe (almacén)
  received_by_position TEXT,

  -- Firma digital/autorización
  received_signature_date TEXT,
  status TEXT DEFAULT 'EN_RESGUARDO' CHECK(status IN ('EN_RESGUARDO','DEVUELTO','BAJA','TRASLADO')),

  user_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
)
```

### **Nueva Tabla: `custody_items` (Detalle de bienes en resguardo)**

```sql
CREATE TABLE IF NOT EXISTS custody_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  custody_entry_id INTEGER NOT NULL,

  -- Datos del bien
  quantity INTEGER NOT NULL,
  inventory_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  serial_number TEXT UNIQUE,

  -- Motivo y estado
  reason TEXT NOT NULL CHECK(reason IN ('BAJA','RESGUARDO','TRASLADO')),
  status TEXT DEFAULT 'EN_RESGUARDO' CHECK(status IN ('EN_RESGUARDO','ACTIVO','INACTIVO','BAJA')),

  -- Condición inicial
  initial_condition TEXT DEFAULT 'BUENO' CHECK(initial_condition IN ('BUENO','DAÑADO','DEFECTUOSO')),

  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (custody_entry_id) REFERENCES custody_entries(id)
)
```

### **Nueva Tabla: `asset_location_history` (Trazabilidad)**

```sql
CREATE TABLE IF NOT EXISTS asset_location_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  custody_item_id INTEGER NOT NULL,

  location TEXT,
  status TEXT,
  moved_by_user_id INTEGER,
  moved_date TEXT,
  reason TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (custody_item_id) REFERENCES custody_items(id),
  FOREIGN KEY (moved_by_user_id) REFERENCES users(id)
)
```

---

## 📋 **CAMPOS DEL FORMULARIO PROPUESTO**

### **Sección 1: DATOS DE ORIGEN**

```
┌─────────────────────────────────────┐
│ Área/Plantel: [________________]    │
│ Clave del Centro: [____________]    │
│ Domicilio: [____________________]   │
│ Municipio: [_________________]      │
│ Zona: [_____________________]        │
└─────────────────────────────────────┘
```

### **Sección 2: DATOS DEL DOCUMENTO**

```
┌─────────────────────────────────────┐
│ Folio (Único): [______________]  ✓  │
│ Fecha de Entrada: [____________]    │
└─────────────────────────────────────┘
```

### **Sección 3: DATOS DEL BIEN** (Repetible)

```
┌─────────────────────────────────────┐
│ Cantidad: [____]   Unidades        │
│ # Inventario: [_____________] ✓     │
│ Descripción: [________________]     │
│ Marca: [__________]                │
│ Modelo: [_________]                │
│ # Serie: [_________]               │
│ Motivo: [ ] Baja [ ] Resguardo     │
│          [ ] Traslado              │
│ Condición: [ ] Bueno [ ] Dañado    │
│            [ ] Defectuoso          │
│ Notas: [_____________________]     │
│ [+ Agregar Bien] [Limpiar]         │
└─────────────────────────────────────┘
```

### **Sección 4: RESPONSABLES**

```
┌─────────────────────────────────────┐
│ ENTREGA (Centro de Trabajo)         │
│ Nombre: [_________________]         │
│ Puesto: [_________________]         │
│                                    │
│ TRANSPORTE (Chofer)                 │
│ Nombre: [_________________]         │
│ Licencia: [________________]        │
│                                    │
│ RECEPCIÓN (Almacén)                 │
│ Nombre: [_________________]         │
│ Puesto: [_________________]         │
└─────────────────────────────────────┘
```

---

## ✅ **VALIDACIONES RECOMENDADAS**

### **A Nivel de Campo**

- ✅ **Folio:** Validar formato, debe ser único (verificar en DB)
- ✅ **Cantidad:** Solo números positivos
- ✅ **# Inventario:** Único, obligatorio
- ✅ **# Serie:** Único si se proporciona
- ✅ **Responsables:** Nombres no vacíos

### **A Nivel de Formulario**

- ✅ Mínimo un bien antes de registrar
- ✅ Todos los responsables capturados
- ✅ Al menos un motivo seleccionado
- ✅ Validación de Folio único contra DB

### **A Nivel de Negocio**

- ✅ No permitir productos sin número de inventario
- ✅ Número de serie debe ser único globalmente (si existe)
- ✅ Una vez registrado, crear trazabilidad

---

## 🔄 **ESTADOS DEL BIEN (Máquina de Estados)**

```
ENTRADA
  ↓
EN_RESGUARDO ←──────────┐
  ├→ ACTIVO             │
  ├→ INACTIVO (no disponible)
  ├→ DAÑADO (requiere reparación)
  ├→ DEVUELTO (al origen)
  ├→ TRASLADO (a otra sede)
  └→ BAJA (fuera de servicio)
```

**Transiciones permitidas:**

- `EN_RESGUARDO` → `ACTIVO` (cuando se recibe)
- `ACTIVO` → `INACTIVO` (mantenimiento)
- `ACTIVO` → `DAÑADO` (reportar daño)
- `DAÑADO` → `ACTIVO` (reparación completada)
- `ACTIVO` → `DEVUELTO` (retorno al origen)
- `ACTIVO` → `TRASLADO` (transferencia)
- `ACTIVO` → `BAJA` (fin de vida útil)

---

## 📊 **REPORTES/CONSULTAS NECESARIAS**

### **1. Consulta: Bienes en Resguardo por Entrada**

```javascript
const getCustodyItems = (entryId) => {
  // SELECT * FROM custody_items WHERE custody_entry_id = ?
};
```

### **2. Consulta: Historial Completo de un Bien**

```javascript
const getAssetHistory = (inventoryNumber) => {
  // SELECT * FROM asset_location_history WHERE custody_item_id = ?
};
```

### **3. Consulta: Bienes sin Devolución**

```javascript
const getPendingCustodyItems = () => {
  // SELECT * FROM custody_items WHERE status = 'EN_RESGUARDO'
};
```

### **4. Reporte: Resguardo por Fecha/Plantel**

```javascript
const getCustodyReport = (fromDate, toDate, plantCode) => {
  // Listar todas las entradas de resguardo en período
};
```

---

## 🎯 **FLUJO DEL USUARIO (UX MEJORADO)**

### **Paso 1: Llenar Datos de Origen**

```
Usuario selecciona o escribe:
- Plantel de origen
- Código de centro de trabajo
- Domicilio
- Municipio, zona
```

### **Paso 2: Datos del Documento**

```
Sistema genera/usuario ingresa:
- Folio único (validación en tiempo real)
- Fecha de entrada (default: hoy)
```

### **Paso 3: Registrar Bienes** (Repetible)

```
Para cada bien:
1. Llenar formulario de bien
2. Click "[+ Agregar Bien]"
3. Bien aparece en tabla/carrito
4. Opción de eliminar/editar
```

### **Paso 4: Responsables**

```
Capturar:
- Nombre y puesto de quien entrega
- Nombre y licencia de transportista
- Nombre y puesto de quien recibe
```

### **Paso 5: Revisión y Confirmación**

```
Mostrar resumen:
- Folio
- Origen
- # Bienes
- Responsables
- Botones: [Registrar] [Cancelar]
```

### **Paso 6: Confirmación**

```
Modal de éxito:
- "Entrada de Resguardo Registrada"
- Número de folio
- Opción: [Generar PDF] [Nueva Entrada] [Ver Detalles]
```

---

## 📄 **PDF DE COMPROBANTE PROPUESTO**

El PDF debe replicar el formato oficial con:

```
LOGO YUCATAN SEGEY
═══════════════════════════════════════════
FORMATO DE ENTREGA-RECEPCIÓN DE BIENES
EN RESGUARDO

Folio: [____________________]
Fecha: [____________________]

DATOS DE ORIGEN
Plantel: ___________________
Código: ____________________
Domicilio: _________________

BIENES RECIBIDOS EN RESGUARDO
┌──────────────────────────────────────┐
│ Inv# │ Descripción │ Marca │ Serie  │
├──────────────────────────────────────┤
│ ... │                              │
└──────────────────────────────────────┘

RESPONSABLES
Entrega: _____________ Firma: _____
Transporte: __________ Firma: _____
Recepción: __________ Firma: _____

Municipio: ________________
Zona: ____________________
```

---

## 🔧 **CAMBIOS EN MÓDULO ACTUAL (Si se mantiene)**

Si decides adaptar el módulo actual en lugar de crear uno nuevo:

### **Cambios requeridos:**

1. ❌ Remover lógica de actualización de stock
2. ❌ Remover búsqueda de productos (usar `assets` en lugar de `products`)
3. ✅ Añadir captura de datos de origen
4. ✅ Añadir captura de responsables detallados
5. ✅ Añadir validación de folio único
6. ✅ Cambiar nombre de "Entrada de Productos" a "Entrada de Resguardo"
7. ✅ Usar tabla `assets` en lugar de `products`

**Ventaja:** Menor cantidad de archivos
**Desventaja:** Lógica confusa y código acoplado

---

## 📝 **RESUMEN DE RECOMENDACIÓN FINAL**

| Aspecto          | Recomendación                                                                |
| ---------------- | ---------------------------------------------------------------------------- |
| **Módulo**       | Crear nuevo: `custody-entry/`                                                |
| **BD**           | Crear 3 tablas: `custody_entries`, `custody_items`, `asset_location_history` |
| **Flujo**        | 5 pasos (Origen → Doc → Bienes → Responsables → Confirmación)                |
| **Validaciones** | Folio único, números de inventario únicos, números de serie únicos           |
| **Estados**      | EN_RESGUARDO, ACTIVO, INACTIVO, DAÑADO, DEVUELTO, TRASLADO, BAJA             |
| **Trazabilidad** | Tabla `asset_location_history` + consultas de historial                      |
| **PDF**          | Comprobante oficial que replica el formato del documento                     |
| **Tiempo Est.**  | 6-8 horas de desarrollo                                                      |

---

## 🚀 **PRÓXIMOS PASOS**

1. ✅ **Crear migraciones DB** para 3 nuevas tablas
2. ✅ **Crear módulo `/custody-entry/`** con componentes
3. ✅ **Implementar validaciones** (especialmente folio único)
4. ✅ **Crear IPC handlers** para CRUD de entrada de resguardo
5. ✅ **Crear vistas de consulta** (historial de bienes)
6. ✅ **Generar PDF** de comprobante oficial
7. ✅ **Agregar ruta y navegación** en Sidebar
8. ✅ **Pruebas** con datos reales del documento

¿Deseas que implemente el módulo completo de resguardo?
