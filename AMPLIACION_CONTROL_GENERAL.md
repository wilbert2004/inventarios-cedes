# Ampliación: Vista de Control General

## 📋 Resumen

Se ha agregado una nueva vista al **Módulo de Registro y Resguardo de Productos** llamada **Control General**, que replica digitalmente un libro físico de control usado para auditoría y seguimiento.

## 🎯 Objetivo

Proporcionar una **relación histórica completa** de todos los productos registrados en el sistema, similar a un libro de control físico, con las siguientes características:

- ✅ Solo consulta - Sin edición
- ✅ Muestra TODOS los productos (activos y dados de baja)
- ✅ Información completa en formato tabular
- ✅ Búsqueda en tiempo real
- ✅ Estadísticas rápidas

## 📄 Archivo Creado

### `src/modules/inventory/ControlGeneralView.jsx`

**Nuevo componente** que implementa la vista de control general.

**Características implementadas**:

1. **Tabla completa con 11 columnas**:
   - Fecha de registro
   - Folio de referencia
   - Centro de trabajo
   - Descripción del equipo
   - Cantidad
   - Marca
   - Modelo
   - Número de inventario
   - Número de serie
   - Motivo
   - Estado actual

2. **Búsqueda avanzada**:
   - Busca en: inventario, serie, descripción, centro, folio, marca, modelo
   - Filtrado en tiempo real
   - Contador de resultados

3. **Estadísticas rápidas**:
   - Total de registros
   - En tránsito
   - En resguardo
   - Baja definitiva

4. **Visualización mejorada**:
   - Productos en BAJA_DEFINITIVA con opacidad reducida
   - Badges de color para estados
   - Badges de color para motivos
   - Formato de fecha localizado (DD/MM/YYYY)

5. **Totalizadores**:
   - Total de registros en vista
   - Suma de cantidades totales

6. **Alertas informativas**:
   - Banner explicativo de vista de solo consulta
   - Información sobre características del módulo
   - Instrucciones de uso

## 📝 Archivos Modificados

### 1. `src/app.jsx`

**Cambios**:

- Importado `ControlGeneralView`
- Agregada ruta `/control-general`

```javascript
import ControlGeneralView from "./modules/inventory/ControlGeneralView";

// ...

<Route path="/control-general" element={<ControlGeneralView />} />;
```

### 2. `src/components/Sidebar.jsx`

**Cambios**:

- Renombrado "Inventario" a "Registro y Resguardo"
- Agregado enlace a "Control General"

```javascript
{
  renderNavLink(
    "/control-general",
    "Control General",
    <svg>...</svg>, // Icono de documento
  );
}
```

### 3. `src/modules/inventory/README.md`

**Cambios**:

- Actualizada estructura del módulo
- Agregada sección "Vista de Control General"
- Documentadas todas las columnas
- Agregada tabla comparativa con vista principal
- Documentados casos de uso

## 🎨 Diseño de la Vista

### Layout

```
┌─────────────────────────────────────────────┐
│ 📚 Control General - Relación Histórica     │
│ Registro completo • Solo consulta           │
├─────────────────────────────────────────────┤
│ ℹ️ Vista de Solo Consulta                   │
│ Esta vista replica un libro físico...       │
├─────────────────────────────────────────────┤
│ [Total] [En Tránsito] [En Resguardo] [Baja]│
├─────────────────────────────────────────────┤
│ Buscar: [____________________________]      │
├─────────────────────────────────────────────┤
│ TABLA DE PRODUCTOS                          │
│ ┌────┬──────┬────────┬──────────┬─────┐    │
│ │Fecha│Folio│Centro  │Descripción│...  │    │
│ ├────┼──────┼────────┼──────────┼─────┤    │
│ │01/02│FOL-1│Norte   │Laptop HP │...  │    │
│ └────┴──────┴────────┴──────────┴─────┘    │
├─────────────────────────────────────────────┤
│ Total registros: 45 | Cantidad total: 78    │
├─────────────────────────────────────────────┤
│ 📋 Acerca del Control General               │
│ • Libro físico digital para auditoría       │
│ • Incluye productos activos y de baja       │
└─────────────────────────────────────────────┘
```

### Colores de Badges

**Estados**:

- 🟧 EN_TRANSITO - Naranja
- 🔵 EN_RESGUARDO - Azul
- ⚪ BAJA_DEFINITIVA - Gris

**Motivos**:

- 🔴 BAJA - Rojo
- 🔵 RESGUARDO - Azul
- 🟣 TRASLADO - Púrpura

## 🔍 Casos de Uso

### 1. Auditoría Interna

**Escenario**: Revisar todos los productos registrados históricament

**Uso**:

1. Navegar a Control General
2. Ver tabla completa con todos los registros
3. Buscar productos específicos por cualquier campo
4. Verificar estados y fechas

### 2. Inventario Físico

**Escenario**: Contrastar inventario físico con registros digitales

**Uso**:

1. Abrir Control General
2. Buscar por número de inventario o serie
3. Verificar descripción, marca, modelo
4. Confirmar estado actual

### 3. Consulta Histórica

**Escenario**: Revisar productos dados de baja en el pasado

**Uso**:

1. Abrir Control General
2. Ver productos con estado BAJA_DEFINITIVA (con opacidad reducida)
3. Buscar por fecha, folio o centro
4. Revisar motivo y estado

### 4. Generación de Reportes

**Escenario**: Exportar datos para reportes externos

**Uso**:

1. Consultar Control General
2. Aplicar filtros de búsqueda si es necesario
3. Ver totalizadores
4. (Futuro: Exportar a Excel/PDF)

### 5. Conciliación de Documentos

**Escenario**: Comparar con documentos físicos de entrega-recepción

**Uso**:

1. Abrir Control General
2. Buscar por folio de referencia
3. Verificar fechas, centros, cantidades
4. Confirmar coincidencia con documentos físicos

## 📊 Datos Mostrados

### Columnas de la Tabla

| #   | Columna                | Origen             | Formato      | Notas                                    |
| --- | ---------------------- | ------------------ | ------------ | ---------------------------------------- |
| 1   | Fecha                  | `created_at`       | DD/MM/YYYY   | Fecha de registro                        |
| 2   | Folio                  | `reference_folio`  | Texto        | Folio del documento                      |
| 3   | Centro de Trabajo      | `center_origin`    | Texto        | Centro de origen                         |
| 4   | Descripción del Equipo | `description`      | Texto        | Descripción completa                     |
| 5   | Cantidad               | `quantity`         | Número       | Unidades                                 |
| 6   | Marca                  | `brand`            | Texto        | Marca del equipo                         |
| 7   | Modelo                 | `model`            | Texto        | Modelo del equipo                        |
| 8   | N° Inventario          | `inventory_number` | Texto (mono) | Único, obligatorio                       |
| 9   | N° Serie               | `serial_number`    | Texto (mono) | Único, opcional                          |
| 10  | Motivo                 | `reason`           | Badge        | BAJA/RESGUARDO/TRASLADO                  |
| 11  | Estado Actual          | `product_status`   | Badge        | EN_TRANSITO/EN_RESGUARDO/BAJA_DEFINITIVA |

### Estadísticas

- **Total de Registros**: COUNT(\*) de todos los productos
- **En Tránsito**: COUNT WHERE product_status = 'EN_TRANSITO'
- **En Resguardo**: COUNT WHERE product_status = 'EN_RESGUARDO'
- **Baja Definitiva**: COUNT WHERE product_status = 'BAJA_DEFINITIVA'

### Totalizadores (Footer)

- **Total de registros en esta vista**: Número de productos mostrados (después de filtros)
- **Cantidad total de equipos**: SUM(quantity) de productos mostrados

## 🚀 Navegación

### Acceso desde el Menú

```
Sidebar → Principal → Control General
```

### Ruta

```
/control-general
```

### Breadcrumb (futuro)

```
Inicio > Registro y Resguardo > Control General
```

## 🔒 Restricciones Implementadas

### Vista de Solo Consulta

✅ **Permitido**:

- Ver todos los registros
- Buscar y filtrar
- Actualizar datos (refrescar)
- Ver estadísticas

❌ **NO Permitido**:

- Editar productos
- Crear nuevos productos
- Eliminar productos
- Cambiar estados
- Modificar datos

### Mensajes Informativos

1. **Banner de Solo Consulta**:
   - Color: Azul claro
   - Ubicación: Arriba de las estadísticas
   - Mensaje: Explica que es vista de consulta y cómo modificar

2. **Footer Informativo**:
   - Color: Amarillo claro
   - Ubicación: Abajo de la tabla
   - Mensaje: Características del Control General

## 📈 Rendimiento

### Optimizaciones

1. **Carga Inicial**:
   - Se cargan todos los productos de una vez
   - Sin paginación por defecto
   - Loading spinner durante carga

2. **Búsqueda**:
   - Filtrado en el cliente (React state)
   - Sin llamadas adicionales al backend
   - Actualización instantánea

3. **Actualización**:
   - Botón manual de actualizar
   - Recarga todos los datos
   - Mantiene términos de búsqueda

### Consideraciones Futuras

Si el número de productos crece significativamente (>1000):

- Implementar paginación del lado del servidor
- Agregar virtual scrolling
- Implementar lazy loading
- Cache de datos

## 🎓 Próximos Pasos Sugeridos

### Corto Plazo

1. **Exportación**:
   - [ ] Botón "Exportar a Excel"
   - [ ] Botón "Exportar a PDF"
   - [ ] Botón "Imprimir"

2. **Filtros Avanzados**:
   - [ ] Filtro por rango de fechas
   - [ ] Filtro por estado
   - [ ] Filtro por motivo
   - [ ] Filtro por centro de trabajo

3. **Ordenamiento**:
   - [ ] Ordenar por cualquier columna
   - [ ] Indicador de columna ordenada
   - [ ] Toggle ASC/DESC

### Mediano Plazo

4. **Paginación**:
   - [ ] Paginación del lado del servidor
   - [ ] Selector de tamaño de página (25/50/100)
   - [ ] Navegación entre páginas

5. **Detalles**:
   - [ ] Modal con detalles completos del producto
   - [ ] Ver historial desde Control General
   - [ ] Enlace a vista de edición (en módulo principal)

6. **Visualización**:
   - [ ] Vista de tarjetas (alternativa a tabla)
   - [ ] Modo compacto/expandido
   - [ ] Columnas personalizables

### Largo Plazo

7. **Reportes**:
   - [ ] Reporte de auditoría
   - [ ] Reporte por centro de trabajo
   - [ ] Reporte por fecha
   - [ ] Reporte de bajas

8. **Integración**:
   - [ ] Sincronización con Excel externo
   - [ ] API REST para consultas externas
   - [ ] Exportación automática programada

---

## ✅ Checklist de Implementación

- [x] Crear componente ControlGeneralView.jsx
- [x] Implementar tabla con 11 columnas
- [x] Agregar búsqueda en tiempo real
- [x] Implementar estadísticas rápidas
- [x] Agregar totalizadores
- [x] Implementar visualización de badges
- [x] Agregar mensajes informativos
- [x] Registrar ruta en app.jsx
- [x] Agregar enlace en Sidebar
- [x] Actualizar README del módulo
- [x] Documentar casos de uso
- [x] Crear documento de ampliación

---

**Fecha de Implementación**: 1 de febrero de 2026  
**Módulo**: Registro y Resguardo de Productos  
**Nueva Vista**: Control General (Relación Histórica)  
**Ruta**: `/control-general`
