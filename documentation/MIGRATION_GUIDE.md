# 🔄 Guía de Migraciones de Base de Datos

Sistema de migraciones versionado que permite actualizar el esquema de la base de datos sin perder datos, incluso con miles de registros.

## ✅ ¿Cómo Funciona?

### Sistema Actual
El sistema usa **CREATE TABLE IF NOT EXISTS**, que es seguro:
- ✅ No afecta tablas existentes
- ✅ Solo crea tablas que no existen
- ✅ No requiere borrar la base de datos

### Sistema de Migraciones Incrementales
Para agregar campos, tablas o relaciones nuevas, se usa un sistema versionado:

1. **Tabla de versiones**: Rastrea qué migraciones se han aplicado
2. **Migraciones incrementales**: Cada cambio es una migración numerada
3. **Aplicación automática**: Se ejecutan al iniciar la aplicación
4. **Transaccional**: Si falla, se revierte todo

## 📋 Agregar Nuevos Campos a Tablas Existentes

### Ejemplo: Agregar campo `category_id` a `products`

**Paso 1**: Editar `src/main/db/migration-system.js`

```javascript
const migrations = [
  {
    version: 1,
    name: "initial_schema",
    up: () => {
      console.log("✓ Migración 1: Esquema inicial");
    },
  },
  // NUEVA MIGRACIÓN
  {
    version: 2,
    name: "add_category_to_products",
    up: () => {
      // Verificar si la columna ya existe (por si se ejecuta dos veces)
      if (!migrationSystem.columnExists("products", "category_id")) {
        db.prepare("ALTER TABLE products ADD COLUMN category_id INTEGER").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)").run();
        console.log("✓ Migración 2: Agregado campo category_id a products");
      }
    },
  },
];
```

**Paso 2**: Actualizar `CURRENT_SCHEMA_VERSION`

```javascript
const CURRENT_SCHEMA_VERSION = 2; // Incrementar a 2
```

**Paso 3**: Actualizar tabla en `tables.js` (para nuevas instalaciones)

```javascript
products: `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    sale_price REAL NOT NULL,
    purchase_cost REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    category_id INTEGER,  // ← NUEVO CAMPO
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`,
```

## 📋 Agregar Nuevas Tablas

### Ejemplo: Crear tabla `categories`

**Paso 1**: Agregar a `tables.js`

```javascript
categories: `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`,
```

**Paso 2**: Agregar migración (si necesitas datos iniciales o índices)

```javascript
{
  version: 3,
  name: "create_categories_table",
  up: () => {
    // La tabla se crea automáticamente con CREATE TABLE IF NOT EXISTS
    // Pero puedes agregar datos iniciales aquí si es necesario
    const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get();
    if (categoryCount.count === 0) {
      db.prepare("INSERT INTO categories (name, active) VALUES (?, ?)").run("General", 1);
      console.log("✓ Migración 3: Tabla categories creada con datos iniciales");
    }
  },
},
```

## 📋 Agregar Relaciones (Foreign Keys)

### Ejemplo: Agregar foreign key de `products.category_id` → `categories.id`

**Nota**: SQLite no soporta `ALTER TABLE ADD FOREIGN KEY` directamente. Tienes dos opciones:

#### Opción 1: Recrear tabla (Solo si es necesario y tienes pocos datos)

```javascript
{
  version: 4,
  name: "add_foreign_key_category",
  up: () => {
    // Solo si realmente necesitas la constraint
    // SQLite permite foreign keys sin constraint explícita
    // Mejor opción: Validar en la aplicación
    console.log("✓ Migración 4: Foreign key validado en aplicación");
  },
},
```

#### Opción 2: Validar en la aplicación (Recomendado)
SQLite permite foreign keys sin constraint. Valida en el código de la aplicación.

## ⚡ Rendimiento con Miles de Registros

### ALTER TABLE en SQLite

**Buenas noticias**: SQLite maneja `ALTER TABLE ADD COLUMN` muy eficientemente:

- ✅ **Operación O(1)**: No copia toda la tabla
- ✅ **Rápido**: Agregar una columna toma milisegundos incluso con millones de registros
- ✅ **Sin bloqueo**: No bloquea lecturas durante la operación
- ✅ **Transaccional**: Si falla, se revierte automáticamente

### Limitaciones de SQLite ALTER TABLE

SQLite solo soporta estas operaciones con `ALTER TABLE`:
- ✅ `ADD COLUMN` - Agregar columna
- ✅ `RENAME TABLE` - Renombrar tabla
- ✅ `RENAME COLUMN` - Renombrar columna (SQLite 3.25.0+)

**NO soporta**:
- ❌ `DROP COLUMN` - Eliminar columna (requiere recrear tabla)
- ❌ `ALTER COLUMN` - Modificar tipo de columna (requiere recrear tabla)
- ❌ `ADD FOREIGN KEY` - Agregar constraint (no necesario, validar en app)

### Para Operaciones NO Soportadas

Si necesitas eliminar una columna o cambiar su tipo:

```javascript
{
  version: 5,
  name: "remove_old_column",
  up: () => {
    // 1. Crear nueva tabla sin la columna
    db.prepare(`
      CREATE TABLE products_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        -- ... otros campos sin el campo a eliminar
      )
    `).run();
    
    // 2. Copiar datos
    db.prepare(`
      INSERT INTO products_new (id, name, ...)
      SELECT id, name, ... FROM products
    `).run();
    
    // 3. Eliminar tabla vieja
    db.prepare("DROP TABLE products").run();
    
    // 4. Renombrar nueva tabla
    db.prepare("ALTER TABLE products_new RENAME TO products").run();
    
    // 5. Recrear índices
    db.prepare("CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode)").run();
    
    console.log("✓ Migración 5: Columna eliminada");
  },
},
```

**⚠️ ADVERTENCIA**: Esta operación puede ser lenta con muchos registros. Hacer respaldo primero.

## 🎯 Mejores Prácticas

### 1. Siempre Verificar Antes de Agregar
```javascript
if (!migrationSystem.columnExists("products", "category_id")) {
  db.prepare("ALTER TABLE products ADD COLUMN category_id INTEGER").run();
}
```

### 2. Usar Transacciones
Las migraciones se ejecutan en transacciones automáticamente. Si falla, se revierte todo.

### 3. Hacer Respaldo Antes de Migraciones Grandes
Para operaciones que recrean tablas, siempre hacer respaldo primero.

### 4. Probar en Desarrollo
Siempre probar migraciones en una copia de la base de datos de producción.

### 5. Migraciones Idempotentes
Las migraciones deben poder ejecutarse múltiples veces sin problemas.

## 📊 Ejemplo Completo: Agregar Categorías

### 1. Crear tabla de categorías

**tables.js**:
```javascript
categories: `
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`,
```

### 2. Agregar campo a products

**migration-system.js**:
```javascript
const migrations = [
  // ... migraciones anteriores
  {
    version: 2,
    name: "add_categories_support",
    up: () => {
      // Agregar campo category_id a products
      if (!migrationSystem.columnExists("products", "category_id")) {
        db.prepare("ALTER TABLE products ADD COLUMN category_id INTEGER").run();
        db.prepare("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id)").run();
      }
      
      // Agregar datos iniciales de categorías
      const categoryCount = db.prepare("SELECT COUNT(*) as count FROM categories").get();
      if (categoryCount.count === 0) {
        db.prepare("INSERT INTO categories (name, active) VALUES (?, ?)").run("General", 1);
        db.prepare("INSERT INTO categories (name, active) VALUES (?, ?)").run("Sin categoría", 1);
      }
      
      console.log("✓ Migración 2: Soporte de categorías agregado");
    },
  },
];

const CURRENT_SCHEMA_VERSION = 2;
```

### 3. Actualizar tabla products en tables.js (para nuevas instalaciones)

```javascript
products: `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    sale_price REAL NOT NULL,
    purchase_cost REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    category_id INTEGER,  // ← NUEVO
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`,
```

## 🔍 Verificar Estado de Migraciones

Puedes verificar qué migraciones se han aplicado:

```sql
SELECT * FROM schema_migrations ORDER BY version;
```

## ⚠️ Importante

### Con Miles de Registros

1. **ALTER TABLE ADD COLUMN**: ✅ Muy rápido (milisegundos)
2. **Recrear tabla**: ⚠️ Puede ser lento (segundos a minutos según cantidad)
3. **Siempre hacer respaldo**: Antes de migraciones grandes
4. **Probar primero**: En una copia de la BD de producción

### SQLite es Eficiente

SQLite está optimizado para:
- ✅ Operaciones de lectura (muy rápidas)
- ✅ ALTER TABLE ADD COLUMN (instantáneo)
- ✅ Transacciones (muy rápidas)
- ✅ Índices (búsquedas rápidas)

**Conclusión**: El sistema funciona bien incluso con miles de registros para la mayoría de operaciones comunes.

## 🚀 Flujo de Actualización

1. Usuario instala nueva versión
2. Aplicación inicia
3. Sistema detecta versión actual vs. versión objetivo
4. Ejecuta migraciones pendientes automáticamente
5. Usuario continúa trabajando sin interrupciones

**No necesita borrar la base de datos** ✅
