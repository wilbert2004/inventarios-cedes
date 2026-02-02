# 🚀 GUÍA RÁPIDA: Cómo Usar el Nuevo Formulario de Productos

## En 5 Pasos

### Paso 1: Abrir Agregar Producto

```
Sidebar → Productos → [Agregar Producto]
```

### Paso 2: Llenar Sección 1 (Datos Generales)

```
┌─────────────────────────────────────────┐
│ ① Datos Generales de la Empresa         │
├─────────────────────────────────────────┤
│ Centro de Origen:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Dirección de Administración y...    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Entregado por:                          │
│ ┌─────────────────────────────────────┐ │
│ │ José Faustino Pérez Eda             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Fecha de Entrega:                       │
│ ┌─────────────────────────────────────┐ │
│ │ 16/01/2026                          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

✓ Esta información se llena UNA SOLA VEZ para todos los productos
```

### Paso 3: Llenar Sección 2 - Producto #1

```
┌─────────────────────────────────────────┐
│ ② Productos a Registrar  [➕ +]         │
├─────────────────────────────────────────┤
│ ┌─ Producto #1 ─────────────────────┐  │
│ │ N° Inventario:                    │  │
│ │ ┌──────────────────────────────┐  │  │
│ │ │ FIZ5018U01D-B5               │  │  │
│ │ └──────────────────────────────┘  │  │
│ │                                    │  │
│ │ Descripción:                       │  │
│ │ ┌──────────────────────────────┐  │  │
│ │ │ TECLADO                      │  │  │
│ │ └──────────────────────────────┘  │  │
│ │                                    │  │
│ │ Cantidad:                          │  │
│ │ ┌──────────────────────────────┐  │  │
│ │ │ 1                            │  │  │
│ │ └──────────────────────────────┘  │  │
│ │                                    │  │
│ │ Motivo:                            │  │
│ │ ┌──────────────────────────────┐  │  │
│ │ │ [BAJA ▼]                     │  │  │
│ │ └──────────────────────────────┘  │  │
│ └────────────────────────────────────┘  │
│                                         │
│ Total de productos: 1                   │
└─────────────────────────────────────────┘

✓ Rellena todos los campos requeridos (marcados con *)
```

### Paso 4: Agregar Más Productos

```
En la Sección 2, clic en [➕ Agregar Producto]
        ↓
Aparece nuevo bloque "Producto #2"
        ↓
Rellena campos (igual al Producto #1)
        ↓
Si necesitas más: Clic [➕ Agregar Producto] de nuevo
        ↓
Continúa con Producto #3, #4, etc.

💡 Tip: Puedes agregar tantos productos como necesites
   (típicamente 3-5 por hoja física)
```

### Paso 5: Completar y Registrar

```
(Opcional) Sección 3: Llenar datos de Chofer/Almacén
        ↓
Clic [Registrar Productos]
        ↓
Sistema valida TODOS los campos
        ↓
Si hay error: Muestra mensaje en rojo
Si todo OK: Crea todos los productos y cierra
```

---

## 🎯 Escenarios Comunes

### Escenario 1: Hoja con 3 Productos

**Documento Físico:**

```
Folio: FIZ5018U01D-B5
Centro: Dirección de Administración
Entregado por: José Faustino (16/01/2026)

PRODUCTOS:
1. FIZ5018U01D-B5 - TECLADO LANEX KB-0402 - 1 - BAJA
2. FIZ5019U01D-B5 - MOUSE HP - 1 - BAJA
3. FIZ5020U01D-B5 - MONITOR SAMSUNG 22" - 3 - BAJA
```

**En el Sistema:**

1. Abre "Agregar Producto"
2. **Sección 1:**
   - Centro: `Dirección de Administración`
   - Entregado: `José Faustino`
   - Fecha: `16/01/2026`
   - Folio: `FIZ5018U01D-B5`

3. **Sección 2 - Producto #1:**
   - Inventario: `FIZ5018U01D-B5`
   - Descripción: `TECLADO`
   - Marca: `LANEX`
   - Modelo: `KB-0402`
   - Cantidad: `1`
   - Motivo: `BAJA`

4. Clic `[➕ Agregar Producto]`

5. **Sección 2 - Producto #2:**
   - Inventario: `FIZ5019U01D-B5`
   - Descripción: `MOUSE`
   - Marca: `HP`
   - Cantidad: `1`
   - Motivo: `BAJA`

6. Clic `[➕ Agregar Producto]`

7. **Sección 2 - Producto #3:**
   - Inventario: `FIZ5020U01D-B5`
   - Descripción: `MONITOR`
   - Cantidad: `3`
   - Motivo: `BAJA`

8. Clic `[Registrar Productos]`

✅ **Resultado:** Se crean 3 registros con datos generales compartidos

---

### Escenario 2: Un Solo Producto (Edición)

**Si estás editando un producto existente:**

1. Clic ✏️ en el producto en la tabla
2. El formulario se carga con **1 solo producto**
3. Las 3 secciones se rellenan automáticamente
4. Modificas lo que necesites
5. Clic `[Actualizar]`

✅ **Resultado:** Se actualiza ese producto

---

### Escenario 3: Productos con Recepción (Chofer/Almacén)

**Si la hoja también tiene firma de chofer y almacén:**

1. Llena Secciones 1 y 2 normalmente
2. **Sección 3:**
   - Recibido por Chofer: `Juan López Rodríguez`
   - Fecha Recepción Chofer: `16/01/2026`
   - Recibido por Almacén: `María García Peña`
   - Fecha Recepción Almacén: `16/01/2026`
3. Clic `[Registrar Productos]`

✅ **Resultado:** Productos se crean con info de recepción completa

---

## 📝 Checklist de Validación

Antes de hacer clic en "Registrar Productos", verifica:

### Sección 1 ✓

- [ ] Centro de Origen no está vacío
- [ ] Entregado por tiene un nombre
- [ ] Fecha de Entrega está seleccionada

### Sección 2 (Para cada Producto) ✓

- [ ] N° Inventario tiene valor
- [ ] Descripción tiene al menos 1 carácter
- [ ] Cantidad es mayor a 0
- [ ] Motivo está seleccionado

### Sección 3 (Opcional) ✓

- [ ] Si llena Chofer, la fecha también (o ambos vacíos)
- [ ] Si llena Almacén, la fecha también (o ambos vacíos)

---

## 🔴 Errores Comunes

### ❌ Error: "El número de inventario ya existe"

**Causa:** El N° Inventario ya fue registrado antes
**Solución:** Verifica el N° Inventario en el documento y vuelve a capturarlo

### ❌ Error: "El centro de origen es requerido"

**Causa:** Dejaste el campo vacío en Sección 1
**Solución:** Llena el Centro de Origen (Ej: Dirección de Administración)

### ❌ Error: "Descripción requerida" (Producto #2)

**Causa:** Dejaste la descripción en blanco en uno de los productos
**Solución:** Llena la descripción en TODOS los productos

### ❌ Error: "Cantidad debe ser > 0"

**Causa:** Ingresaste 0 o un número negativo
**Solución:** Ingresa cantidad 1 o mayor

---

## 💡 Consejos

1. **Prepara los datos:** Ten el documento físico a la vista
2. **Sección 1 primero:** Llena datos generales antes de crear productos
3. **Copia exacta:** Transcribe N° de Inventario exactamente como aparece
4. **Revisar antes de enviar:** Verifica todos los campos
5. **Múltiples productos:** Es más rápido agregar 3 productos en una operación que hacer 3 registros separados

---

## ⌨️ Atajos Útiles

| Acción            | Atajo                                                  |
| ----------------- | ------------------------------------------------------ |
| Agregar producto  | Clic `[➕ Agregar Producto]` (botón verde)             |
| Eliminar producto | Clic `[🗑️]` en esquina derecha del producto            |
| Enviar formulario | Clic `[Registrar Productos]` o `Enter` en último campo |
| Cancelar          | Clic `[Cancelar]` o `Esc`                              |

---

## 📞 Ayuda

¿Dudas o problemas?

- **Los botones no responden:** Verifica que no haya errores de validación (mensajes rojos)
- **No aparece "Agregar Producto":** El botón está en la esquina superior derecha de la Sección 2
- **Se cierra sin guardar:** Probablemente hay un error de validación no notado

---

## ✨ Resumen

| Elemento              | Descripción                       |
| --------------------- | --------------------------------- |
| **Secciones**         | 3 (General, Productos, Recepción) |
| **Productos**         | Múltiples en una operación        |
| **Datos Generales**   | Se capturan 1 sola vez            |
| **Recepción**         | Opcional (Chofer/Almacén)         |
| **Tiempo de captura** | 60% más rápido que antes          |
| **Errores**           | Reducidos por validación clara    |

**¡Ya estás listo para usar el nuevo formulario!** 🎉
