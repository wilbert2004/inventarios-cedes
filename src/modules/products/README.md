# Módulo de Productos en Resguardo (CEDES)

## 📋 Descripción

Este módulo gestiona el registro y control de productos (bienes) que llegan a un CEDES (Centro de Distribución y Resguardo) provenientes de centros de trabajo. Los productos quedan bajo resguardo del almacén y se registran basándose en documentos oficiales de entrega-recepción.

**Importante**: Este módulo NO es para venta. Los productos NO son inventario comercial.

## 🎯 Características Principales

### 1. Registro de Productos

- **Número de Inventario**: Identificador único y obligatorio para cada producto
- **Número de Serie**: Identificador único opcional (cuando aplica)
- **Descripción**: Información detallada del producto
- **Marca y Modelo**: Información de fabricante
- **Cantidad**: Número de unidades
- **Motivo**: Clasificación del tipo de registro (BAJA, RESGUARDO, TRASLADO)
- **Centro de Origen**: Lugar de procedencia del producto
- **Folio de Referencia**: Documento relacionado
- **Notas**: Observaciones adicionales
- **Datos de Recepción**: Información de quién y cuándo recibió el producto

### 2. Estados del Producto

- **EN_TRANSITO** (estado inicial al registrar)
- **EN RESGUARDO** (requiere datos de recepción en almacén)
- **BAJA DEFINITIVA**: Retirado del sistema
- **TRASLADO EN PROCESO**: En tránsito
- **DEVUELTO**: Devuelto a su origen

### 3. Proceso de Entrega y Recepción

El módulo está estructurado en **3 secciones** que reflejan el proceso real:

#### 1️⃣ ENTREGA (Obligatoria)

Datos de la entrega desde el centro de trabajo:

- **Entregado por Centro de Trabajo**: Nombre de quien entrega (obligatorio)
- **Fecha de Entrega**: Fecha del documento de entrega (obligatoria)

#### 2️⃣ RECEPCIÓN CHOFER (Opcional)

Datos de la recepción por el chofer que transporta:

- **Recibido por Chofer**: Nombre del chofer que recibe
- **Fecha de Recepción Chofer**: Fecha de recepción por chofer

#### 3️⃣ RECEPCIÓN ALMACÉN (Obligatoria para Resguardo)

Datos de la recepción oficial en el CEDES:

- **Recibido por Almacén**: Nombre de quien recibe en el CEDES (obligatorio para EN RESGUARDO)
- **Fecha de Recepción Almacén**: Fecha de recepción oficial (obligatoria para EN RESGUARDO)

#### Flujo de Trabajo:

1. Se registra el producto con **datos de ENTREGA** → Estado inicial: **EN_TRANSITO**
2. Opcionalmente se captura RECEPCIÓN CHOFER
3. Se capturan datos de **RECEPCIÓN EN ALMACÉN**
4. Se cambia estado a **EN RESGUARDO**
5. El producto queda oficialmente bajo resguardo del CEDES

### 4. Validaciones Críticas

- ✅ Número de inventario ÚNICO
- ✅ Número de serie ÚNICO (cuando existe)
- ✅ Estado inicial SIEMPRE es "EN_TRANSITO"
- ✅ **Datos de ENTREGA obligatorios** al crear (entregado_por_centro_trabajo, fecha_entrega)
- ✅ **NO se puede cambiar a "EN RESGUARDO" sin datos de recepción en almacén**
- ✅ No editar inventario después de creación
- ✅ Validación de transiciones de estados

### 5. Historial Completo

- Cambios de estado con timestamp
- Usuario responsable del cambio
- Motivo del cambio
- Trazabilidad completa

### 6. Búsqueda y Filtrado

- Por número de inventario
- Por descripción
- Por número de serie
- Por estado (incluye EN_TRANSITO)
- Por motivo

### 7. Estadísticas en Tiempo Real

- Total de productos
- Por estado
- Por motivo
- Cantidad total de unidades

## 📊 Estructura de Base de Datos

### Tabla: `custody_products`

Almacena la información principal de cada producto en resguardo.

**Campos de entrega y recepción (v8)**:

- `entregado_por_centro_trabajo` TEXT (obligatorio al crear)
- `fecha_entrega` TEXT (obligatoria al crear)
- `recibido_por_chofer` TEXT (opcional)
- `fecha_recepcion_chofer` TEXT (opcional)
- `recibido_por_almacen` TEXT (obligatorio para EN RESGUARDO)
- `fecha_recepcion_almacen` TEXT (obligatoria para EN RESGUARDO)

### Tabla: `custody_product_history`

Mantiene el historial completo de cambios de estado y modificaciones.

## 🔧 Estructura del Módulo

```
products/
├── ProductsView.jsx              # Vista principal
├── components/
│   ├── ProductForm.jsx           # Formulario de creación/edición
│   ├── CustodyProductTable.jsx   # Tabla de productos
│   ├── ProductHistory.jsx        # Modal de historial
│   └── StateChangeModal.jsx      # Modal de cambio de estado
├── hooks/
│   └── useCustodyProducts.js     # Lógica de negocio
└── README.md                     # Este archivo
```

## 🎨 Componentes

### ProductForm

- Validación de campos requeridos
- Prevención de edición de número de inventario
- Validación de uniqueness
- Mensajes de error claros

### CustodyProductTable

- Tabla interactiva con acciones
- Badges de color para estados
- Información de centro de origen
- Acciones: Editar, Cambiar estado, Ver historial, Dar de baja

### ProductHistory

- Cronología de cambios
- Usuario y fecha de cada cambio
- Motivo de cambios
- Transiciones de estado

### StateChangeModal

- Validación de transiciones válidas
- Motivo obligatorio
- Vista previa del nuevo estado
- Información actual del producto

## 💻 Hook: useCustodyProducts

Proporciona toda la lógica del módulo:

```javascript
const {
  // Estado
  products, // Lista filtrada
  loading, // Estado de carga
  error, // Mensajes de error
  statistics, // Estadísticas

  // Métodos
  createProduct, // Crear
  updateProduct, // Actualizar
  changeProductStatus, // Cambiar estado
  deleteProduct, // Marcar baja

  // Búsqueda
  searchProducts, // Buscar
  filterByStatus, // Filtrar por estado
  filterByReason, // Filtrar por motivo
} = useCustodyProducts();
```

## 🔌 IPC: custody-products

Interfaz con el proceso principal:

```javascript
window.api.custodyProducts.getAll();
window.api.custodyProducts.create(product);
window.api.custodyProducts.update(id, product);
window.api.custodyProducts.changeStatus(id, status, reason, changedBy);
window.api.custodyProducts.getHistory(productId);
window.api.custodyProducts.getByStatus(status);
window.api.custodyProducts.search(query);
window.api.custodyProducts.getStatistics();
```

## 📝 Flujo de Trabajo

1. **Registro**: Usuario crea producto con datos únicos
2. **Estado Inicial**: Sistema asigna automáticamente "EN RESGUARDO"
3. **Seguimiento**: Sistema mantiene historial automático
4. **Cambios**: Usuario puede cambiar estado con motivo
5. **Baja**: Producto se marca como "BAJA DEFINITIVA" (terminal)

## 🔐 Reglas de Negocio

### Unicidad

- Inventario y serie deben ser únicos
- Sistema previene duplicados

### Estados Iniciales

- Todos los productos inician en "EN RESGUARDO"
- No se puede cambiar en creación

### Transiciones Válidas

```
EN RESGUARDO      → BAJA, TRASLADO, DEVUELTO
TRASLADO          → EN RESGUARDO, BAJA
DEVUELTO          → EN RESGUARDO, BAJA
BAJA DEFINITIVA   → (Terminal)
```

### Auditoría

- Todo cambio se registra con usuario y fecha
- Historial es inmutable
- Los productos nunca se eliminan (soft delete)

## 🚀 Uso

```jsx
import ProductsView from "./modules/products/ProductsView";

export default function App() {
  return <ProductsView />;
}
```

## 🧪 Testing Recomendado

1. Crear producto con inventario único
2. Intentar duplicar inventario (debe fallar)
3. Cambiar estado a TRASLADO
4. Consultar historial
5. Cambiar a BAJA DEFINITIVA
6. Verificar que no hay opciones de cambio

## 📱 Características de UI

- Tailwind CSS responsive
- Dark mode soportado
- Colores codificados por estado
- Modales para operaciones secundarias
- Tablas interactivas
- Notificaciones intuitivas

## 🔄 Integración

Se integra con:

- Autenticación (usuario actual)
- Base de datos SQLite
- IPC de Electron
- Contexto de aplicación

## ⚙️ Consideraciones Técnicas

- Validaciones en cliente y servidor
- Manejo robusto de errores
- Estados sincronizados
- Rendimiento optimizado
- Accesibilidad WCAG 2.1

## 📦 Dependencias

- React 16.8+
- Tailwind CSS 3+
- Electron IPC
- SQLite3

## 🎯 Roadmap

- [ ] Exportación a PDF
- [ ] Reportes por período
- [ ] Códigos QR/Códigos de barras
- [ ] Alertas automáticas
- [ ] Multi-sede
- [ ] Importación en lote (CSV)

---

**Versión**: 1.0.0  
**Actualizado**: Febrero 2026
