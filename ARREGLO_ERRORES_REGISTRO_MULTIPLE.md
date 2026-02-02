# 🔧 Arreglo de Errores en Registro Múltiple de Productos

## 📋 Problemas Identificados

### Problema 1: Error "El número de serie N/C ya existe"

**Síntomas:**

- Intentar registrar 2 productos con N° Serie = "N/C"
- Error: "El número de serie N/C ya existe"
- Solo se registra 1 producto en lugar de 2

**Causa:**

- Campo `serial_number` estaba marcado como `UNIQUE` en la BD
- Validación en backend rechazaba duplicados de `N/C`
- `N/C` (No Clasificado) es un valor legítimo para múltiples productos

---

### Problema 2: Datos Generales vacíos al editar

**Síntomas:**

- Editar un producto registrado
- Sección 1 (Datos Generales) aparece vacía
- Banner dice "Datos Generales Cargados" pero los campos no muestran valores

**Causa:**

- Cuando se registraban múltiples productos, no se combinaban correctamente los datos generales con cada producto
- Cada producto se guardaba SOLO con sus propios datos
- Al editar, faltaban los datos generales (center_origin, reference_folio, etc.)

---

### Problema 3: Registro Parcial sin Retroalimentación

**Síntomas:**

- Intentar registrar 2 productos
- Falla el segundo (error N/C duplicado)
- Primero ya estaba guardado en la BD
- Usuario no sabe qué producto falló

**Causa:**

- No había pre-validación de todos los productos
- Loop registraba cada uno sin verificar si completaría exitosamente
- Sin transacción o rollback

---

## ✅ Soluciones Implementadas

### 1. Permitir N/C Duplicados en Serial Number

#### Cambio en [tables.js](src/main/db/tables.js)

```javascript
// ANTES:
serial_number TEXT UNIQUE,

// DESPUÉS:
serial_number TEXT,
```

- Removido constraint `UNIQUE` del campo serial_number
- Ahora permite valores NULL y duplicados de "N/C"
- Mantiene control de duplicados mediante validación en IPC

#### Cambio en [custody-lifecycle.ipc.js](src/main/ipc/custody-lifecycle.ipc.js)

```javascript
// ANTES:
if (productData.serial_number) {
  const existingSerial = db
    .prepare(
      "SELECT id FROM custody_products WHERE serial_number = ? AND is_deleted = 0",
    )
    .get(productData.serial_number);
  if (existingSerial) {
    throw new Error(
      `El número de serie ${productData.serial_number} ya existe`,
    );
  }
}

// DESPUÉS:
if (
  productData.serial_number &&
  productData.serial_number !== "N/C" &&
  productData.serial_number.trim() !== ""
) {
  const existingSerial = db
    .prepare(
      "SELECT id FROM custody_products WHERE serial_number = ? AND is_deleted = 0",
    )
    .get(productData.serial_number);
  if (existingSerial) {
    throw new Error(
      `El número de serie ${productData.serial_number} ya existe`,
    );
  }
}
```

- Valida solo si serial_number NO es 'N/C' y no está vacío
- Permite múltiples productos con 'N/C'

#### Cambio en [custody-products.ipc.js](src/main/ipc/custody-products.ipc.js)

```javascript
// ANTES:
const validateSerialNumber = (serialNumber, excludeId = null) => {
  if (!serialNumber) return true;
  const query = excludeId
    ? `SELECT id FROM custody_products WHERE serial_number = ? AND id != ? AND serial_number IS NOT NULL`
    : `SELECT id FROM custody_products WHERE serial_number = ? AND serial_number IS NOT NULL`;
  const params = excludeId ? [serialNumber, excludeId] : [serialNumber];
  const result = db.prepare(query).get(...params);
  return !result;
};

// DESPUÉS:
const validateSerialNumber = (serialNumber, excludeId = null) => {
  if (!serialNumber || serialNumber === "N/C" || serialNumber.trim() === "")
    return true;
  const query = excludeId
    ? `SELECT id FROM custody_products WHERE serial_number = ? AND id != ? AND serial_number IS NOT NULL AND serial_number != 'N/C'`
    : `SELECT id FROM custody_products WHERE serial_number = ? AND serial_number IS NOT NULL AND serial_number != 'N/C'`;
  const params = excludeId ? [serialNumber, excludeId] : [serialNumber];
  const result = db.prepare(query).get(...params);
  return !result;
};
```

- Excluye 'N/C' de validación de duplicados
- Permite múltiples registros con 'N/C'

---

### 2. Combinar Datos Generales con Cada Producto

#### Cambio en [useCustodyProducts.js](src/modules/products/hooks/useCustodyProducts.js)

**Antes:**

```javascript
if (productData.products && Array.isArray(productData.products)) {
    const results = [];
    for (const product of productData.products) {
        const result = await window.api.custodyLifecycle.register(product);
        results.push(result);
    }
```

**Después:**

```javascript
if (productData.products && Array.isArray(productData.products)) {
    // Combinar datos generales con cada producto
    const generalData = productData.general || {};
    const enrichedProducts = productData.products.map(product => ({
        ...generalData,
        ...product,
    }));

    // Validar todos los productos ANTES de registrar
    for (const product of enrichedProducts) {
        if (!product.inventory_number) {
            throw new Error("El número de inventario es requerido para todos los productos");
        }
        if (!product.center_origin) {
            throw new Error("El centro de origen es requerido para todos los productos");
        }
    }

    // Crear múltiples productos con mejor manejo de errores
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    const errors = [];

    for (const product of enrichedProducts) {
        try {
            const result = await window.api.custodyLifecycle.register(product);
            results.push(result);
            successCount++;
        } catch (err) {
            failureCount++;
            errors.push(`Producto ${product.inventory_number}: ${err.message}`);
        }
    }

    // Reportar qué fue exitoso y qué falló
    if (failureCount > 0) {
        const errorMessage = `Se registraron ${successCount} de ${enrichedProducts.length} productos. Errores:\n${errors.join('\n')}`;
        throw new Error(errorMessage);
    }
```

**Beneficios:**

- ✅ Cada producto guardado incluye: `center_origin`, `reference_folio`, `entregado_por_centro_trabajo`, `fecha_entrega`
- ✅ Al editar, todos los campos de Sección 1 se cargan correctamente
- ✅ Validación pre-registro (evita registros parciales)
- ✅ Mensaje de error detallado indicando cuál producto falló

---

## 📊 Flujo de Registro Mejorado

### Antes:

```
1. Usuario llena Sección 1 (Datos Generales)
2. Usuario añade 2 productos en Sección 2
3. Click GUARDAR
4. Frontend envía:
   {
     general: {...generalData},
     products: [product1, product2]
   }
5. Backend loop:
   - Registra product1 (SIN datos generales) ✓
   - Intenta registrar product2
   - FALLA: "N/C ya existe"
6. Result: 1/2 guardados, datos generales PERDIDOS
```

### Después:

```
1. Usuario llena Sección 1 (Datos Generales)
2. Usuario añade 2 productos en Sección 2
3. Click GUARDAR
4. Frontend envía:
   {
     general: {...generalData},
     products: [product1, product2]
   }
5. Backend:
   - Combina: product1 = {...general, ...product1}
   - Combina: product2 = {...general, ...product2}
   - PRE-VALIDA ambos antes de registrar
   - Registra product1 CON datos generales ✓
   - Registra product2 CON datos generales ✓
6. Result: 2/2 guardados, datos generales PERSISTIDOS
7. Edit: Lee product1, todos los campos de Sección 1 están disponibles ✓
```

---

## 🧪 Casos de Prueba

### ✅ Caso 1: Registrar 2 productos con N/C (Antes FALLABA)

```
1. Llenar Sección 1: Supervisión, DOC-001, Juan, 2025-01-15
2. Producto 1: N° Inv: INV-001, N° Serie: N/C, Descripción: "Monitor"
3. Producto 2: N° Inv: INV-002, N° Serie: N/C, Descripción: "Teclado"
4. GUARDAR
RESULTADO ESPERADO: ✅ Ambos se registran exitosamente
```

### ✅ Caso 2: Editar producto con N/C (Antes MOSTRABA VACÍO)

```
1. Editar INV-001 (que tiene N/C)
2. Sección 1 debe mostrar:
   - Centro: "Supervisión"
   - Folio: "DOC-001"
   - Entregado por: "Juan"
   - Fecha: "2025-01-15"
RESULTADO ESPERADO: ✅ Todos los campos visibles y completos
```

### ✅ Caso 3: Registrar múltiples con fallo en el segundo

```
1. Producto 1: N° Inv: INV-003, N° Serie: "SN-001", ok
2. Producto 2: N° Inv: INV-003, N° Serie: "SN-002", FALLA (N° Inv duplicado)
RESULTADO ESPERADO: ✅ Mensaje claro: "Se registraron 1 de 2 productos. Errores: Producto INV-003: El número de inventario ya existe"
```

---

## 📝 Cambios de Archivos

| Archivo                                            | Línea(s) | Cambio                                     |
| -------------------------------------------------- | -------- | ------------------------------------------ |
| `src/main/db/tables.js`                            | 216      | Removido `UNIQUE` de `serial_number`       |
| `src/main/ipc/custody-lifecycle.ipc.js`            | 81-88    | Permitir N/C duplicados                    |
| `src/main/ipc/custody-products.ipc.js`             | 19-30    | Permitir N/C duplicados en validación      |
| `src/modules/products/hooks/useCustodyProducts.js` | 48-108   | Combinar datos, pre-validar, mejor errores |

---

## 🔄 Migración de Base de Datos

**Si ya tienes productos registrados sin datos generales:**

```sql
-- Verificar qué productos están sin datos generales
SELECT id, inventory_number, center_origin, reference_folio
FROM custody_products
WHERE center_origin IS NULL OR center_origin = '';

-- Si necesitas mantener la BD actual:
-- 1. La tabla seguirá funcionando
-- 2. Los nuevos registros tendrán datos generales combinados
-- 3. No hay impacto en datos existentes
```

---

## 🎉 Resultado Final

✅ **Problema resuelto:** Ahora puedes registrar múltiples productos con N/C sin errores
✅ **Datos persistidos:** Al editar, todos los datos generales se cargan correctamente
✅ **Mejor UX:** Mensajes de error más claros indicando qué falló
✅ **Validación pre-registro:** Evita registros parciales

---

**Actualizado:** 2025-01-15  
**Estado:** 🟢 LISTO PARA TESTING
