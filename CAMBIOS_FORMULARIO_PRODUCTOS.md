# 📋 Restructuración del Formulario de Agregar Productos

## Cambio Principal

El formulario **"Agregar Productos"** ha sido restructurado en **3 secciones principales** siguiendo la estructura física del documento de recolección de bienes de baja.

---

## 📐 Estructura de 3 Secciones

### **SECCIÓN 1️⃣: Datos Generales** (Azul)

Información de la empresa/centro que origina la salida

**Campos:**

- 🏢 **Centro de Origen** (Obligatorio) - Ej: Dirección de Administración y Finanzas
- 📑 **Folio de Referencia** - Ej: DOC-2026-001
- 👤 **Entregado por** (Obligatorio) - Nombre de quien entrega desde el centro
- 📅 **Fecha de Entrega** (Obligatorio) - Fecha de la entrega

**Equivalencia en documento físico:**

```
┌─────────────────────────────────────────────────┐
│ FOLIO: FIZ5018U01D-B5                          │
│ AREA O PLANTEL: SUPERVISION DE PRIMARIA NUM. 94│
│ DOMICILIO: AVENIDA VICTOR MANUEL CERVERA       │
├─────────────────────────────────────────────────┤
│ Entrega (Centro de Trabajo)                     │
│ Nombre: José Faustino Pérez Eda                 │
│ Fecha: 16/01/2026                              │
└─────────────────────────────────────────────────┘
```

---

### **SECCIÓN 2️⃣: Productos** (Verde)

Lista de productos a registrar (3-5 por hoja típicamente)

**Características:**

- ➕ Botón "Agregar Producto" para añadir más productos
- 🗑️ Botón "Eliminar" en cada producto (si hay más de 1)
- 📊 Contador total de productos

**Campos por Producto:**

- 🔢 **N° Inventario** (Obligatorio) - Ej: FIZ5018U01D-B5
- 🔤 **N° Serie** - Ej: SN123456789
- 📝 **Descripción** (Obligatorio) - Ej: TECLADO, COMPUTADORA
- 🏷️ **Marca** - Ej: LANEX, DELL
- ⚙️ **Modelo** - Ej: KB-0402
- 📦 **Cantidad** (Obligatorio) - Número de unidades
- 🎯 **Motivo** (Obligatorio) - BAJA, RESGUARDO, TRASLADO
- 📌 **Notas/Observaciones** - Anotaciones adicionales

**Equivalencia en documento físico:**

```
┌─────────────────────────────────────────────────────┐
│ TABLA DE PRODUCTOS:                                  │
├──────────────────────────────────────────────────────┤
│ NO. | CANT. | NO. DE INVENTARIO | DESCRIPCION | ... │
├──────────────────────────────────────────────────────┤
│ 1   | 1     | FIZ5018U01D       | TECLADO     | ... │
│ 2   | 1     | FIZ5019U01D       | MOUSE       | ... │
│ 3   | 3     | FIZ5020U01D       | MONITOR     | ... │
└──────────────────────────────────────────────────────┘
```

---

### **SECCIÓN 3️⃣: Datos de Recepción** (Púrpura)

Información de recepción por chofer y almacén (Opcional)

**Campos:**

- 🚗 **Recibido por (Chofer)** - En dado caso
- 📅 **Fecha Recepción (Chofer)** - En dado caso
- 🏭 **Recibido por (Almacén)** - En dado caso
- 📅 **Fecha Recepción (Almacén)** - En dado caso

**Equivalencia en documento físico:**

```
┌─────────────────────────────────────────────────┐
│ Recibe (Chofer)                                  │
│ Nombre: _______________                         │
│ Fecha: _______________                          │
├─────────────────────────────────────────────────┤
│ Recibe (Almacén)                                │
│ Nombre: _______________                         │
│ Fecha: _______________                          │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Trabajo

### **Caso 1: Registrar múltiples productos de una hoja**

1. Llenar **Sección 1** una sola vez (datos del centro)
2. Agregar primer producto en **Sección 2**
3. Hacer clic en "➕ Agregar Producto"
4. Llenar segundo producto
5. Repetir hasta tener todos los productos (3-5)
6. (Opcional) Llenar **Sección 3** si llega por chofer/almacén
7. Clic en "Registrar Productos" - **Se crean todos de una vez**

### **Caso 2: Editar un producto existente**

1. El formulario detecta que es edición
2. Se carga en el mismo formato (3 secciones)
3. Se pueden modificar los datos
4. Clic en "Actualizar"

---

## 💾 Cambios en el Backend

### Hook: `useCustodyProducts.js`

**Nuevo método `createProduct`:**

```javascript
// Detecta si es un solo producto o múltiples
if (productData.products && Array.isArray(productData.products)) {
  // Crea múltiples productos en loop
  for (const product of productData.products) {
    await window.api.custodyLifecycle.register(product);
  }
} else {
  // Crea un solo producto (para edición)
  await window.api.custodyLifecycle.register(productData);
}
```

### Estructura de Datos

**Para múltiples productos:**

```javascript
{
    general: {
        center_origin: "Dirección de Administración",
        reference_folio: "DOC-2026-001",
        entregado_por_centro_trabajo: "José Faustino",
        fecha_entrega: "2026-02-01"
    },
    products: [
        {
            inventory_number: "FIZ5018U01D-B5",
            serial_number: "SN001",
            description: "TECLADO",
            brand: "LANEX",
            model: "KB-0402",
            quantity: 1,
            reason: "BAJA",
            notes: "",
            recibido_por_chofer: "",
            fecha_recepcion_chofer: "",
            recibido_por_almacen: "",
            fecha_recepcion_almacen: ""
        },
        {
            inventory_number: "FIZ5019U01D-B5",
            // ... más productos
        }
    ]
}
```

---

## 🎨 Estilos Visuales

| Sección            | Color             | Icono | Estado                    |
| ------------------ | ----------------- | ----- | ------------------------- |
| 1. Datos Generales | Azul (#2563EB)    | ①     | Gradiente azul-indigo     |
| 2. Productos       | Verde (#16A34A)   | ②     | Gradiente verde-esmeralda |
| 3. Recepción       | Púrpura (#A855F7) | ③     | Gradiente púrpura-rosa    |

---

## ✅ Validaciones

### Sección 1 (Obligatorias)

- ✓ Centro de Origen
- ✓ Entregado por
- ✓ Fecha de Entrega

### Sección 2 (Por cada producto)

- ✓ N° Inventario (único en la BD)
- ✓ Descripción
- ✓ Cantidad > 0
- ✓ Motivo

### Sección 3 (Opcional)

- Todos los campos son opcionales

---

## 🔧 Cómo Usar

### Agregar una hoja con 3 productos

1. **Abrir "Agregar Producto"**
2. **Llenar Sección 1 (Datos Generales):**
   - Centro de Origen: `Dirección de Administración y Finanzas`
   - Entregado por: `José Faustino Pérez Eda`
   - Fecha: `16/01/2026`

3. **Llenar Sección 2 - Producto 1:**
   - N° Inventario: `FIZ5018U01D-B5`
   - Descripción: `TECLADO`
   - Cantidad: `1`
   - Motivo: `BAJA`
   - Clic "➕ Agregar Producto"

4. **Llenar Sección 2 - Producto 2:**
   - N° Inventario: `FIZ5019U01D-B5`
   - Descripción: `MOUSE`
   - Cantidad: `1`
   - Motivo: `BAJA`
   - Clic "➕ Agregar Producto"

5. **Llenar Sección 2 - Producto 3:**
   - N° Inventario: `FIZ5020U01D-B5`
   - Descripción: `MONITOR`
   - Cantidad: `3`
   - Motivo: `BAJA`

6. **(Opcional) Llenar Sección 3** si viene con chofer/almacén

7. **Clic "Registrar Productos"** - Se crean los 3 de una vez

---

## 📊 Comparativa: Antes vs Después

### ❌ ANTES (Formulario simple)

```
┌─────────────────────────────┐
│ Agregar Producto (1)        │
├─────────────────────────────┤
│ □ N° Inventario             │
│ □ Descripción               │
│ □ Centro                    │
│ □ Entregado por             │
│ □ Fecha Entrega             │
│ [Registrar]                 │
└─────────────────────────────┘
```

**Problema:** Si una hoja tenía 3 productos, había que hacer 3 registros separados, perdiendo la relación.

---

### ✅ DESPUÉS (Formulario en 3 secciones)

```
┌──────────────────────────────────────────┐
│ ① DATOS GENERALES (Empresa)              │
├──────────────────────────────────────────┤
│ □ Centro de Origen                       │
│ □ Entregado por                          │
│ □ Fecha Entrega                          │
├──────────────────────────────────────────┤
│ ② PRODUCTOS (1, 2, 3...)                 │
├──────────────────────────────────────────┤
│ Producto #1                              │
│ □ N° Inventario  □ Descripción          │
│ □ Cantidad       □ Motivo                │
│ [➕ Agregar Producto]                    │
│                                          │
│ Producto #2                              │
│ □ N° Inventario  □ Descripción          │
│ □ Cantidad       □ Motivo                │
├──────────────────────────────────────────┤
│ ③ RECEPCIÓN (Chofer/Almacén - Opcional) │
├──────────────────────────────────────────┤
│ □ Recibido por (Chofer)                  │
│ □ Recibido por (Almacén)                 │
├──────────────────────────────────────────┤
│ [Registrar Productos]  [Cancelar]        │
└──────────────────────────────────────────┘
```

**Ventajas:**

- ✅ Datos generales una sola vez
- ✅ Múltiples productos en una operación
- ✅ Mantiene relación de la hoja física
- ✅ Menos clics y errores
- ✅ Interfaz clara y organizada

---

## 📝 Ejemplo Real: Hoja FIZ5018U01D-B5

**Documento Físico:**

```
FOLIO: FIZ5018U01D-B5
AREA: SUPERVISION DE PRIMARIA NUM. 94
Entrega: José Faustino Pérez Eda (16/01/2026)

PRODUCTOS:
1. TECLADO (LANEX KB-0402) - 1 unidad - BAJA
2. MOUSE (HP) - 1 unidad - BAJA
3. MONITOR (SAMSUNG) - 3 unidades - BAJA
```

**En el Sistema - Un solo registro:**

```
General:
  - Centro: SUPERVISION DE PRIMARIA NUM. 94
  - Entregado: José Faustino Pérez Eda
  - Fecha: 16/01/2026
  - Folio: FIZ5018U01D-B5

Productos: [3]
  1. FIZ5018U01D-B5 / TECLADO / LANEX KB-0402 / 1 / BAJA
  2. FIZ5018U01D-B5 / MOUSE / HP / 1 / BAJA
  3. FIZ5018U01D-B5 / MONITOR / SAMSUNG / 3 / BAJA
```

---

## 🎯 Resultado Final

✅ **Formulario estructurado en 3 secciones claras**
✅ **Soporte para múltiples productos de una vez**
✅ **Interfaz similar a documento físico**
✅ **Validaciones completas**
✅ **Mantiene datos generales una sola vez**
✅ **Campos de recepción (chofer/almacén) opcionales**
✅ **Botón para agregar/eliminar productos dinámicamente**
✅ **Sin errores de compilación**
