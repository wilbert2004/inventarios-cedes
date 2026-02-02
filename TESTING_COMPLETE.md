# 🧪 GUÍA DE TESTING: Nuevo Formulario de Productos

## ✅ Lista de Verificación Completa

### 1. Cargar Aplicación

- [ ] Inicia la aplicación Electron
- [ ] Sin errores en consola
- [ ] Interfaz carga correctamente

### 2. Navegar al Formulario

- [ ] En Sidebar, clic **"Productos"**
- [ ] Se abre lista de productos
- [ ] Clic **"Agregar Producto"** o botón similar
- [ ] Modal/página se abre con las 3 secciones

### 3. Verificar Secciones

- [ ] **Sección 1** visible (Azul) - Datos Generales
- [ ] **Sección 2** visible (Verde) - Productos
- [ ] **Sección 3** visible (Púrpura) - Recepción

---

## 📋 Test Case 1: Crear 1 Producto (Básico)

### Datos

```
Centro: Dirección de Administración
Entregado por: José García
Fecha: 16/01/2026
Folio: DOC-2026-001

Producto #1:
  Inventario: PRUEBA001
  Serie: SN12345
  Descripción: COMPUTADORA
  Marca: DELL
  Modelo: XPS-15
  Cantidad: 1
  Motivo: RESGUARDO
```

### Pasos

1. Clic **"Agregar Producto"**
2. **Sección 1:**
   - [ ] Centro: `Dirección de Administración`
   - [ ] Entregado: `José García`
   - [ ] Fecha: `16/01/2026`
   - [ ] Folio: `DOC-2026-001`

3. **Sección 2 - Producto #1:**
   - [ ] Inventario: `PRUEBA001`
   - [ ] Serie: `SN12345`
   - [ ] Descripción: `COMPUTADORA`
   - [ ] Marca: `DELL`
   - [ ] Modelo: `XPS-15`
   - [ ] Cantidad: `1`
   - [ ] Motivo: `RESGUARDO`

4. **Sección 3:** (Dejar vacío)

5. Clic **"Registrar Productos"**

### Verificar

- [ ] No hay errores de validación
- [ ] Se cierra el formulario
- [ ] Aparece mensaje de éxito
- [ ] En tabla de Productos:
  - [ ] Aparece nuevo registro `PRUEBA001`
  - [ ] Datos coinciden
  - [ ] Estado es `EN_TRANSITO` (inicial)

---

## 📋 Test Case 2: Crear 3 Productos (Múltiples)

### Datos

```
Centro: Supervisión de Primaria 94
Entregado por: José Faustino
Fecha: 16/01/2026
Folio: FIZ5018U01D-B5

Producto #1: FIZ5018U01D-B5 | TECLADO | LANEX KB-0402 | 1 | BAJA
Producto #2: FIZ5019U01D-B5 | MOUSE | HP | 1 | BAJA
Producto #3: FIZ5020U01D-B5 | MONITOR | SAMSUNG 22 | 3 | BAJA
```

### Pasos

1. Clic **"Agregar Producto"**

2. **Sección 1** (llenar todo):

   ```
   Centro: Supervisión de Primaria 94
   Entregado: José Faustino
   Fecha: 16/01/2026
   Folio: FIZ5018U01D-B5
   ```

3. **Sección 2 - Producto #1:**

   ```
   Inventario: FIZ5018U01D-B5
   Descripción: TECLADO
   Cantidad: 1
   Motivo: BAJA
   ```

4. Clic **"➕ Agregar Producto"**
   - [ ] Aparece nuevo bloque "Producto #2"
   - [ ] Contador muestra "Total: 2"

5. **Sección 2 - Producto #2:**

   ```
   Inventario: FIZ5019U01D-B5
   Descripción: MOUSE
   Cantidad: 1
   Motivo: BAJA
   ```

6. Clic **"➕ Agregar Producto"**
   - [ ] Aparece "Producto #3"
   - [ ] Contador muestra "Total: 3"

7. **Sección 2 - Producto #3:**

   ```
   Inventario: FIZ5020U01D-B5
   Descripción: MONITOR
   Cantidad: 3
   Motivo: BAJA
   ```

8. Clic **"Registrar Productos"**

### Verificar

- [ ] No hay errores
- [ ] Cierra formulario
- [ ] Mensaje de éxito
- [ ] En tabla: Aparecen 3 nuevos registros
- [ ] Todos tienen misma fecha y entrega
- [ ] Cada uno con su inventario único

---

## 📋 Test Case 3: Validaciones (Errores)

### Test 3.1: Campo Obligatorio Vacío

1. Abre formulario
2. **NO llenar** Centro de Origen
3. Clic "Registrar"

- [ ] Aparece error rojo: "El centro de origen es requerido"
- [ ] Formulario NO se cierra
- [ ] Foco en campo

### Test 3.2: Cantidad = 0

1. Abre formulario
2. Llena Sección 1 OK
3. Sección 2, Producto #1:
   - [ ] Centro y Entrega: OK
   - [ ] Cantidad: `0` (inválido)
4. Clic "Registrar"

- [ ] Error rojo: "Cantidad debe ser > 0"
- [ ] Formulario NO se cierra

### Test 3.3: Inventario Duplicado

1. Crea producto con Inventario: `TEST123`
2. Abre nuevo formulario
3. Intenta registrar con mismo Inventario: `TEST123`
4. Clic "Registrar"

- [ ] Error: "El número de inventario ya existe"
- [ ] No se crea

---

## 📋 Test Case 4: Agregar/Eliminar Dinámico

### Test 4.1: Agregar Múltiples

1. Abre formulario
2. Clic `[➕ Agregar Producto]` 5 veces

- [ ] Aparecen 6 bloques totales (1 inicial + 5)
- [ ] Contador: "Total: 6"
- [ ] Cada bloque tiene número único (#1, #2, #3, etc.)

### Test 4.2: Eliminar Productos

1. Con 6 productos activos
2. Clic `[🗑️]` en Producto #3

- [ ] Se elimina Producto #3
- [ ] Quedan 5
- [ ] Contador: "Total: 5"
- [ ] Los demás se renumeran (mantienen datos)

3. Clic `[🗑️]` en Producto #1

- [ ] Se elimina
- [ ] Quedan 4
- [ ] Otros conservan datos

### Test 4.3: Eliminar hasta Quedar 1

1. Clic `[🗑️]` hasta que solo queda 1

- [ ] El último NO tiene botón `[🗑️]`
- [ ] No se puede eliminar el único
- [ ] Contador: "Total: 1"

---

## 📋 Test Case 5: Edición (Actualizar)

### Pasos

1. En tabla de Productos, clic `[✏️]` editar
2. Formulario carga con datos existentes

- [ ] Sección 1 llena
- [ ] Solo 1 producto en Sección 2
- [ ] Sección 3 llena (si existe)

3. Modifica un campo (ej: Cantidad)
4. Clic **"Actualizar"**

- [ ] Sin errores
- [ ] Se cierra
- [ ] En tabla: cambio reflejado

---

## 📋 Test Case 6: Datos de Recepción (Sección 3)

### Test 6.1: Llenar Recepción

1. Abre formulario
2. Llena Secciones 1 y 2 OK
3. **Sección 3:**
   - Recibido por Chofer: `Juan López`
   - Fecha Chofer: `17/01/2026`
   - Recibido por Almacén: `María García`
   - Fecha Almacén: `17/01/2026`
4. Clic "Registrar"

- [ ] Sin errores
- [ ] Se crea
- [ ] En Control General: Datos de recepción visibles

### Test 6.2: Dejar Vacío (Opcional)

1. Abre formulario
2. Llena Secciones 1 y 2 OK
3. **Sección 3:** Dejar todos vacíos
4. Clic "Registrar"

- [ ] Sin errores (es opcional)
- [ ] Se crea OK
- [ ] En Control General: Campos vacíos se ven como "-"

---

## 📋 Test Case 7: Dark Mode

1. En aplicación, activar Dark Mode
2. Abre formulario

- [ ] Secciones mantienen colores (gradientes visible)
- [ ] Texto legible
- [ ] Inputs con fondo oscuro
- [ ] Botones contrastados

---

## 📋 Test Case 8: Responsivo (Desktop vs Tablet)

### Desktop (>768px)

1. Abre formulario en pantalla ancha

- [ ] Campos se distribuyen en 2 columnas (md:grid-cols-2)
- [ ] Layout es compacto
- [ ] Todo cabe sin scroll

### Tablet/Mobile (<768px)

1. Redimensiona ventana o abre en tablet

- [ ] Campos en 1 columna (grid-cols-1)
- [ ] Texto es legible
- [ ] Botones son clickeables
- [ ] Sin elementos superpuestos

---

## 📋 Test Case 9: Flujo Completo (End to End)

### Scenario: Registrar hoja de recolección real

1. **Abre formulario**

2. **Sección 1:**

   ```
   Centro: Dirección de Administración y Finanzas
   Folio: FIZ5018-2026-001
   Entregado: José Faustino Pérez Eda
   Fecha: 16/01/2026
   ```

3. **Sección 2 - Producto #1:**

   ```
   Inv: TEC-001
   Serie: SN-2026-001
   Desc: TECLADO MECÁNICO
   Marca: CORSAIR
   Modelo: K95
   Cant: 1
   Motivo: BAJA
   Notas: Tecla no responde
   ```

4. **Agregar más:** Clic `[➕]`

5. **Sección 2 - Producto #2:**

   ```
   Inv: MOU-001
   Serie: SN-2026-002
   Desc: MOUSE INALÁMBRICO
   Marca: LOGITECH
   Modelo: G502
   Cant: 1
   Motivo: BAJA
   Notas: Sensor dañado
   ```

6. **Agregar más:** Clic `[➕]`

7. **Sección 2 - Producto #3:**

   ```
   Inv: MON-001
   Serie: SN-2026-003
   Desc: MONITOR LED 22"
   Marca: LG
   Modelo: 22MK430H
   Cant: 2
   Motivo: TRASLADO
   Notas: Para oficina 3
   ```

8. **Sección 3:**

   ```
   Chofer: Carlos López González
   Fecha: 16/01/2026
   Almacén: Patricia Gómez
   Fecha: 16/01/2026
   ```

9. Clic **"Registrar Productos"**

### Verificaciones Finales

- [ ] ✅ Sin errores de validación
- [ ] ✅ Formulario se cierra
- [ ] ✅ Mensaje de éxito visible
- [ ] ✅ En tabla de Productos:
  - [ ] TEC-001 visible
  - [ ] MOU-001 visible
  - [ ] MON-001 visible
- [ ] ✅ Cada uno muestra estado `EN_TRANSITO`
- [ ] ✅ Datos generales compartidos
- [ ] ✅ En Control General:
  - [ ] Los 3 productos aparecen
  - [ ] Datos de recepción visibles
  - [ ] Botón `[👁️]` funciona (abre detalles)

---

## 🐛 Reporte de Bugs (Si Encuentras)

Usa este formato:

```
BUG #[número]
Título: [Breve descripción]
Severidad: [Crítico / Alto / Medio / Bajo]
Pasos para reproducir:
1. ...
2. ...
3. ...

Resultado esperado:
...

Resultado actual:
...

Screenshots: [Si es posible]
```

---

## ✨ Resultado Esperado Final

Después de completar todos los tests:

- ✅ Formulario funciona correctamente
- ✅ Validaciones previenen errores
- ✅ Múltiples productos funcionan
- ✅ Edición funciona
- ✅ Datos persisten en BD
- ✅ Dark mode funciona
- ✅ Responsivo en todos los tamaños
- ✅ Sin errores en consola

---

## 📞 Próximos Pasos

Si todos los tests pasan:

1. ✅ Implementación lista para producción
2. ✅ Documentar cambios en release notes
3. ✅ Entrenar usuarios en nuevo formulario
4. ✅ Monitorear primeros usos

Si hay bugs:

1. 📝 Reportar con detalle
2. 🔧 Reparar
3. 🧪 Re-testear
4. ✅ Marcar como resuelto

---

**¡Éxito con el testing!** 🚀
