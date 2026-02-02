# 🔄 Notas de Migración

Este archivo contiene información importante sobre cambios en la base de datos y cómo migrar datos existentes.

## ⚠️ Cambio en la Tabla de Productos - Código de Barras

**Fecha**: 2024-01-03  
**Versión**: 1.1.0

### Cambio Realizado

Se agregó el campo `barcode` (código de barras) a la tabla `products`:

```sql
ALTER TABLE products ADD COLUMN barcode TEXT UNIQUE;
CREATE INDEX idx_products_barcode ON products(barcode);
```

### ¿Necesito hacer algo?

#### Si es una instalación nueva:
✅ **No requiere acción**. La tabla se creará automáticamente con el nuevo campo.

#### Si ya tienes datos en la base de datos:
⚠️ **Acción requerida**: La base de datos existente NO se actualizará automáticamente.

Tienes dos opciones:

### Opción 1: Empezar de cero (Recomendado para desarrollo)

1. Cierra la aplicación
2. Elimina el archivo de base de datos:
   - **Windows**: `C:\Users\<usuario>\AppData\Roaming\absolute-pos-app\pos.db`
   - **macOS**: `~/Library/Application Support/absolute-pos-app/pos.db`
   - **Linux**: `~/.config/absolute-pos-app/pos.db`
3. Reinicia la aplicación (se creará una nueva base de datos con el campo barcode)

### Opción 2: Migrar los datos existentes (Recomendado para producción)

Si tienes productos importantes que no quieres perder, sigue estos pasos:

1. **Hacer backup de la base de datos actual**
   ```bash
   # Copiar el archivo pos.db a un lugar seguro
   cp pos.db pos.db.backup
   ```

2. **Ejecutar la migración SQL**
   
   Puedes usar cualquier herramienta SQLite (como DB Browser for SQLite) o ejecutar directamente:

   ```bash
   sqlite3 pos.db
   ```

   Luego ejecuta estos comandos:

   ```sql
   -- Agregar la columna barcode
   ALTER TABLE products ADD COLUMN barcode TEXT;
   
   -- Crear el índice
   CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
   
   -- Verificar que se agregó correctamente
   PRAGMA table_info(products);
   
   -- Salir
   .quit
   ```

3. **Reinicia la aplicación**

### Verificación

Para verificar que la migración fue exitosa:

1. Abre la aplicación
2. Ve a "Productos"
3. Haz clic en "Nuevo Producto"
4. Deberías ver el campo "Código de barras" en el formulario

## 📝 Cambios Futuros

Este archivo se actualizará con cada cambio en la estructura de la base de datos.

### Próximas migraciones planeadas:

- [ ] Tabla de usuarios con autenticación
- [ ] Tabla de categorías de productos
- [ ] Tabla de proveedores
- [ ] Tabla de métodos de pago

---

## ✅ Sistema de Migraciones Automático Implementado

**¡Buenas noticias!** El sistema ahora tiene migraciones automáticas versionadas.

### ¿Cómo Funciona?

1. **No necesitas borrar la BD**: Los cambios se aplican automáticamente
2. **Funciona con miles de registros**: SQLite está optimizado para esto
3. **Automático**: Se ejecuta al iniciar la aplicación

### Para Agregar Nuevos Campos

Ver [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) para la guía completa.

**Ejemplo rápido**:
1. Editar `src/main/db/migration-system.js`
2. Agregar nueva migración
3. Incrementar `CURRENT_SCHEMA_VERSION`
4. ¡Listo! Se aplica automáticamente

### Rendimiento

- ✅ `ALTER TABLE ADD COLUMN`: Milisegundos (incluso con millones de registros)
- ✅ `CREATE INDEX`: Rápido (segundos)
- ✅ `CREATE TABLE IF NOT EXISTS`: Instantáneo

**Conclusión**: No necesitas borrar la BD. El sistema maneja todo automáticamente.

