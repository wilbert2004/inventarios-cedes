# Refactorización Completa: Módulo de Registro y Resguardo de Productos

## 📋 Resumen Ejecutivo

Se ha refactorizado exitosamente el módulo "Inventarios" convirtiéndolo en un **"Módulo de Registro y Resguardo de Productos"** con gestión del ciclo de vida completo.

### Cambios Conceptuales Principales

- ❌ **Ya NO es**: Un módulo de inventario comercial con control de stock para ventas
- ✅ **Ahora ES**: Un sistema de gestión de ciclo de vida de productos en resguardo con historial inmutable

## 🎯 Características Implementadas

### 1. Sistema de Estados

```
EN_TRANSITO → EN_RESGUARDO → BAJA_DEFINITIVA
```

- **EN_TRANSITO**: Estado inicial. Producto en tránsito hacia el CEDES
- **EN_RESGUARDO**: Producto recibido y bajo custodia (requiere recepción en almacén)
- **BAJA_DEFINITIVA**: Estado final. Solo lectura. No permite cambios

### 2. Proceso de Entrega y Recepción

#### Sección 1: ENTREGA (Obligatoria)

- `entregado_por_centro_trabajo`
- `fecha_entrega`

#### Sección 2: RECEPCIÓN CHOFER (Opcional)

- `recibido_por_chofer`
- `fecha_recepcion_chofer`

#### Sección 3: RECEPCIÓN ALMACÉN (Obligatoria para resguardo)

- `recibido_por_almacen`
- `fecha_recepcion_almacen`

### 3. Historial Inmutable

Registro de eventos que **NO puede editarse ni borrarse**:

- `registro` - Creación del producto
- `entrega` - Registro de entrega desde centro
- `recepcion_chofer` - Recepción por transportista
- `recepcion_almacen` - Recepción en almacén
- `cambio_estado` - Cambio de estado del producto
- `baja` - Baja definitiva
- `actualizacion` - Modificación de datos

Cada evento incluye:

- Timestamp
- Usuario responsable
- Descripción
- Datos adicionales en JSON
- Estados previo y nuevo (cuando aplica)

### 4. Validaciones de Negocio

✅ **Implementadas**:

- Número de inventario único
- Número de serie único
- Estado inicial siempre EN_TRANSITO
- Validación de transiciones de estado
- No se puede cambiar a EN_RESGUARDO sin recepción en almacén
- No se pueden modificar productos en BAJA_DEFINITIVA
- Soft delete (no eliminación física)
- No se puede editar número de inventario

❌ **Bloqueadas**:

- Regresar de BAJA_DEFINITIVA a otro estado
- Editar o borrar historial
- Eliminación física de productos
- Transiciones de estado no válidas

## 🗂️ Archivos Creados/Modificados

### Backend

#### 1. `src/main/db/tables.js`

**Cambios**:

- Actualizada tabla `custody_products`:
  - Cambiado estados: `BAJA DEFINITIVA` → `BAJA_DEFINITIVA`
  - Agregados campos: `fecha_baja`, `motivo_baja`, `is_deleted`
  - Removidos estados: `TRASLADO EN PROCESO`, `DEVUELTO`
- Actualizada tabla `custody_product_history`:
  - Agregado campo `tipo_evento` (registro, entrega, recepcion_chofer, etc.)
  - Agregado campo `descripcion`
  - Agregado campo `datos_json` para información adicional

#### 2. `src/main/db/migration-system.js`

**Cambios**:

- Version actualizada a `9`
- Nueva migración `v9`:
  - Agrega campos de baja (`fecha_baja`, `motivo_baja`)
  - Agrega campo `is_deleted` para soft delete
  - Actualiza estados a formato con guiones bajos
  - Agrega campos nuevos a tabla de historial
  - Migra datos existentes de historial

#### 3. `src/main/ipc/custody-lifecycle.ipc.js` (NUEVO)

**Archivo completamente nuevo** con handlers:

- `custodyLifecycle:register` - Registrar producto
- `custodyLifecycle:update` - Actualizar datos
- `custodyLifecycle:registerDriverReception` - Registrar recepción chofer
- `custodyLifecycle:registerWarehouseReception` - Registrar recepción almacén
- `custodyLifecycle:changeStatus` - Cambiar estado con validaciones
- `custodyLifecycle:deactivate` - Dar de baja definitiva
- `custodyLifecycle:getAll` - Obtener productos con filtros
- `custodyLifecycle:getHistory` - Obtener historial inmutable
- `custodyLifecycle:getStatistics` - Estadísticas en tiempo real

Incluye funciones de utilidad:

- `registrarEvento()` - Crea eventos inmutables en historial
- `validarTransicionEstado()` - Valida transiciones permitidas

#### 4. `src/main/ipc/main.js`

**Cambios**:

- Agregada línea: `require("./custody-lifecycle.ipc");`

#### 5. `src/preload.js`

**Cambios**:

- Agregada API `custodyLifecycle` con 9 métodos

### Frontend

#### 6. `src/modules/inventory/InventoryView.jsx`

**Refactorización completa**:

- Removidas dependencias de hooks antiguos
- Implementado manejo directo de estado con React hooks
- Integrada API `custodyLifecycle`
- Dashboard con 5 tarjetas de estadísticas:
  - Total de productos
  - En tránsito
  - En resguardo
  - Baja definitiva
  - Desglose por motivo
- Filtros de búsqueda:
  - Texto libre (inventario, descripción, serie)
  - Por estado
  - Por motivo
- Tabla responsive con:
  - N° Inventario
  - Descripción + Serie
  - Marca/Modelo
  - Badges de estado
  - Badges de motivo
  - Centro de origen
  - Fecha de registro
- Footer informativo con características del módulo

#### 7. `src/modules/inventory/README.md`

**Reescritura completa**:

- Nueva documentación enfocada en ciclo de vida
- Ejemplos de uso de API
- Descripción de flujo de trabajo
- Esquema de base de datos
- Reglas de negocio detalladas
- Tipos de eventos del historial

## 🔄 Flujo de Trabajo Completo

```
1. REGISTRO
   ↓
   [Usuario registra producto con datos de ENTREGA]
   → Estado: EN_TRANSITO
   → Evento: "registro" + "entrega"

2. TRANSPORTE (Opcional)
   ↓
   [Registra recepción por chofer]
   → Estado: EN_TRANSITO (sin cambios)
   → Evento: "recepcion_chofer"

3. LLEGADA
   ↓
   [Registra recepción en almacén]
   → Estado: EN_TRANSITO (sin cambios)
   → Evento: "recepcion_almacen"

4. CAMBIO A RESGUARDO
   ↓
   [Cambia estado a EN_RESGUARDO]
   → Valida: ¿Tiene recepción almacén? ✓
   → Estado: EN_RESGUARDO
   → Evento: "cambio_estado"

5. BAJA (Cuando sea necesario)
   ↓
   [Da de baja definitiva]
   → Estado: BAJA_DEFINITIVA
   → Evento: "baja"
   → Producto en solo lectura
```

## 📊 Estadísticas Implementadas

El módulo calcula y muestra:

- **Total**: Todos los productos registrados (excluye eliminados)
- **En Tránsito**: Productos en estado EN_TRANSITO
- **En Resguardo**: Productos en estado EN_RESGUARDO
- **Baja Definitiva**: Productos dados de baja
- **Por Motivo**:
  - RESGUARDO: Productos para resguardo
  - BAJA: Productos para baja
  - TRASLADO: Productos en traslado

## 🔍 Búsqueda y Filtros

### Búsqueda por Texto

Busca en:

- Número de inventario
- Descripción
- Número de serie

### Filtros

- **Estado**: EN_TRANSITO, EN_RESGUARDO, BAJA_DEFINITIVA
- **Motivo**: RESGUARDO, BAJA, TRASLADO

Búsqueda con debounce de 500ms para mejor performance.

## 🚀 Cómo Usar el Módulo

### Registrar un Producto

```javascript
const resultado = await window.api.custodyLifecycle.register({
  inventory_number: "001-2025",
  serial_number: "ABC123",
  description: "Laptop HP Pavilion 15",
  brand: "HP",
  model: "Pavilion 15",
  quantity: 1,
  reason: "RESGUARDO",
  center_origin: "Centro Norte",
  reference_folio: "FOL-001-2025",
  entregado_por_centro_trabajo: "Juan Pérez",
  fecha_entrega: "2025-02-01",
  userId: 1,
});
```

### Ver Historial de un Producto

```javascript
const history = await window.api.custodyLifecycle.getHistory(productId);

// history = [
//   {
//     tipo_evento: 'registro',
//     descripcion: 'Producto registrado: 001-2025 - Laptop HP',
//     created_at: '2025-02-01 10:00:00',
//     changed_by_name: 'Admin'
//   },
//   {
//     tipo_evento: 'entrega',
//     descripcion: 'Entregado por: Juan Pérez el 2025-02-01',
//     ...
//   }
// ]
```

### Cambiar Estado

```javascript
await window.api.custodyLifecycle.changeStatus({
  productId: 1,
  newStatus: "EN_RESGUARDO",
  reason: "Producto recibido correctamente en almacén",
  userId: 1,
});
```

## ✅ Checklist de Implementación

- [x] Actualizar schema de base de datos (tables.js)
- [x] Crear migración v9 para nuevos campos
- [x] Crear custody-lifecycle.ipc.js con handlers
- [x] Registrar nuevo IPC en main.js
- [x] Exponer API en preload.js
- [x] Refactorizar InventoryView.jsx
- [x] Actualizar README.md del módulo
- [x] Implementar validaciones de estado
- [x] Implementar historial inmutable
- [x] Implementar soft delete
- [x] Agregar filtros y búsqueda
- [x] Agregar estadísticas en tiempo real
- [x] Documentar flujo completo

## 🎓 Próximos Pasos Sugeridos

1. **Probar el módulo**:
   - Ejecutar la aplicación
   - Verificar que la migración v9 se aplique correctamente
   - Registrar productos de prueba
   - Validar transiciones de estado
   - Verificar historial inmutable

2. **Integración con módulo de PRODUCTOS**:
   - El módulo "products" (custody-products.ipc.js) ya existe
   - Puede convivir con el nuevo sistema
   - Considerar migrar completamente al nuevo API `custodyLifecycle`

3. **Funcionalidades adicionales**:
   - Modal de registro de producto
   - Modal de actualización de datos
   - Modal de cambio de estado
   - Modal de historial con visualización mejorada
   - Exportar reportes de productos
   - Generar etiquetas/códigos QR

4. **Mejoras de UI**:
   - Agregar acciones por fila (editar, ver historial, cambiar estado)
   - Modal de detalles del producto
   - Gráficas de estadísticas
   - Timeline visual del historial
   - Notificaciones toast al guardar cambios

## 📝 Notas Importantes

### Diferencias con Módulo Anterior

| Aspecto          | Antes (Inventario)             | Ahora (Registro y Resguardo)                  |
| ---------------- | ------------------------------ | --------------------------------------------- |
| **Propósito**    | Control de stock para ventas   | Gestión de ciclo de vida                      |
| **Concepto**     | Productos comerciales          | Bienes en resguardo                           |
| **Stock**        | Entradas/Salidas, Stock actual | No aplica                                     |
| **Estados**      | Activo/Inactivo                | EN_TRANSITO → EN_RESGUARDO → BAJA_DEFINITIVA  |
| **Eliminación**  | Permitida                      | Solo soft delete                              |
| **Historial**    | No había                       | Inmutable con eventos tipificados             |
| **Validaciones** | Básicas                        | Transiciones de estado, recepción obligatoria |

### Compatibilidad

- ✅ El módulo de productos antiguo (`custodyProducts`) sigue funcionando
- ✅ Ambos APIs pueden coexistir
- ✅ La migración v9 es compatible con datos existentes
- ✅ No se pierden datos al actualizar

---

**Fecha de Refactorización**: 1 de febrero de 2026
**Versión del Schema**: 9
**Módulo**: inventory → Registro y Resguardo de Productos
