# 💰 Análisis: Sistema Multicaja

## ✅ Estado Actual - Preparado para Multicaja

### Lo que ya tienes:
1. **Usuarios con roles** - Ya tienes cajeros (`cashier`) y administradores
2. **Ventas asociadas a usuarios** - Cada venta tiene `user_id` (cajero)
3. **Inventario compartido** - El stock es global (perfecto para multicaja)
4. **Base de datos estructurada** - SQLite con relaciones bien definidas

### Lo que falta para multicaja:

## 🔧 Cambios Necesarios

### 1. Base de Datos

#### Nueva tabla: `registers` (Cajas/Terminales)
```sql
CREATE TABLE registers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,              -- "Caja 1", "Caja 2", etc.
  location TEXT,                    -- "Piso 1", "Entrada", etc.
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

#### Modificar tabla: `sales`
```sql
ALTER TABLE sales ADD COLUMN register_id INTEGER;
CREATE INDEX idx_sales_register ON sales(register_id);
```

#### Nueva tabla: `register_sessions` (Sesiones de caja)
```sql
CREATE TABLE register_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  register_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,         -- Cajero que abre la sesión
  opening_amount REAL DEFAULT 0,     -- Efectivo inicial
  closing_amount REAL,              -- Efectivo al cerrar
  opened_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT,
  status TEXT DEFAULT 'open',       -- 'open' | 'closed'
  FOREIGN KEY (register_id) REFERENCES registers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2. Funcionalidades a Agregar

#### A. Selección de Caja al Iniciar
- Al iniciar sesión, el usuario selecciona en qué caja trabajará
- Validar que la caja no esté ocupada por otro usuario
- Crear sesión de caja automáticamente

#### B. Cierre de Caja
- Botón "Cerrar Caja" en el POS
- Contar efectivo físico
- Comparar con ventas registradas
- Generar reporte de cierre
- Cerrar sesión de caja

#### C. Reportes por Caja
- Ventas por caja
- Cierres de caja
- Comparación entre cajas
- Efectivo por caja

#### D. Gestión de Cajas
- CRUD de cajas (solo admin)
- Activar/desactivar cajas
- Ver estado de cajas (abierta/cerrada)

### 3. Cambios en el Código

#### SalesView.jsx
```javascript
// Agregar estado de caja actual
const [currentRegister, setCurrentRegister] = useState(null);

// Al crear venta, incluir register_id
const saleData = {
  userId: user?.id,
  registerId: currentRegister.id,  // ← NUEVO
  total: total,
  // ...
};
```

#### sales.ipc.js
```javascript
// Modificar query para incluir register_id
INSERT INTO sales (user_id, register_id, total, payment_method, created_at)
VALUES (?, ?, ?, ?, ?)
```

## 🏗️ Arquitectura Recomendada

### Opción 1: Base de Datos Compartida (Recomendada para inicio)
- **Ventaja**: Más simple, no requiere servidor
- **Desventaja**: Requiere red compartida (carpeta compartida en Windows)
- **Uso**: Pequeños negocios con 2-5 cajas en la misma red local

**Implementación:**
- Mover base de datos a carpeta compartida en red
- Todas las instancias apuntan a la misma base de datos
- SQLite soporta acceso concurrente (con limitaciones)

### Opción 2: Servidor Central (Recomendada para escalar)
- **Ventaja**: Mejor rendimiento, más escalable
- **Desventaja**: Requiere servidor y más complejidad
- **Uso**: Negocios medianos/grandes con múltiples ubicaciones

**Implementación:**
- Servidor Node.js con Express
- API REST para todas las operaciones
- Base de datos PostgreSQL/MySQL en servidor
- Clientes Electron se conectan al servidor

### Opción 3: Sincronización Híbrida
- **Ventaja**: Funciona offline, sincroniza cuando hay conexión
- **Desventaja**: Más complejo de implementar
- **Uso**: Negocios con conexión intermitente

**Implementación:**
- Cada caja tiene su base de datos local
- Sincronización periódica con servidor central
- Resolución de conflictos

## 📊 Flujo de Trabajo Multicaja

### 1. Inicio de Sesión
```
Usuario → Login → Seleccionar Caja → Abrir Sesión de Caja → POS
```

### 2. Durante el Turno
```
Cajero trabaja en su caja → Todas las ventas se registran con register_id
```

### 3. Cierre de Caja
```
Cajero → Cerrar Caja → Contar efectivo → Generar reporte → Cerrar sesión
```

### 4. Reportes
```
Admin → Ver ventas por caja → Comparar rendimiento → Cierres de caja
```

## 🎯 Plan de Implementación Sugerido

### Fase 1: Preparación (1-2 días)
1. Crear tabla `registers`
2. Agregar campo `register_id` a `sales`
3. Crear tabla `register_sessions`
4. Migraciones de base de datos

### Fase 2: Selección de Caja (2-3 días)
1. Vista de selección de caja después del login
2. Validación de caja disponible
3. Apertura automática de sesión
4. Guardar caja actual en contexto

### Fase 3: Integración en Ventas (1 día)
1. Modificar `sales:create` para incluir `register_id`
2. Actualizar queries de reportes para filtrar por caja
3. Mostrar caja actual en el POS

### Fase 4: Cierre de Caja (3-4 días)
1. Vista de cierre de caja
2. Cálculo de ventas del turno
3. Comparación efectivo físico vs registrado
4. Generación de reporte de cierre
5. Cerrar sesión de caja

### Fase 5: Gestión de Cajas (2-3 días)
1. CRUD de cajas (solo admin)
2. Vista de estado de cajas
3. Activar/desactivar cajas

### Fase 6: Reportes por Caja (2-3 días)
1. Filtros por caja en reportes
2. Comparación entre cajas
3. Dashboard de cajas

**Total estimado: 11-16 días de desarrollo**

## ⚠️ Consideraciones Importantes

### SQLite y Concurrencia
- SQLite soporta múltiples lectores simultáneos
- Solo un escritor a la vez (con bloqueo)
- Para más de 3-4 cajas simultáneas, considerar PostgreSQL

### Sincronización de Stock
- Con base compartida: automático (todos ven el mismo stock)
- Con bases separadas: necesitas sincronización en tiempo real

### Identificación de Cajas
- Puedes usar el nombre de la computadora
- O un ID único por instalación
- O selección manual al iniciar

## 🚀 Recomendación

**Para empezar con multicaja:**

1. **Opción rápida**: Base de datos compartida en red local
   - Implementar tablas de cajas y sesiones
   - Selección de caja al iniciar
   - Cierre de caja básico
   - **Tiempo: 1-2 semanas**

2. **Opción escalable**: Servidor central
   - Migrar a arquitectura cliente-servidor
   - API REST con Node.js
   - Base de datos PostgreSQL
   - **Tiempo: 1-2 meses**

## 📝 Conclusión

**Sí, tu sistema puede ser multicaja.** La estructura actual ya tiene la base:
- ✅ Usuarios/cajeros
- ✅ Ventas asociadas a usuarios
- ✅ Inventario compartido

**Solo necesitas agregar:**
- Tabla de cajas
- Campo `register_id` en ventas
- Sesiones de caja
- Selección de caja al iniciar
- Cierre de caja

¿Quieres que implemente alguna de estas funcionalidades ahora?
