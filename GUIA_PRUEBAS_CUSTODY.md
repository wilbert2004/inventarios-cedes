# GUÍA DE PRUEBAS - MÓDULO DE RESGUARDO

## 🧪 Pasos para Probar el Módulo

### Paso 1: Iniciar la Aplicación

1. Abre la aplicación Sistema de Inventario
2. Login con usuario Admin
3. La migración v6 se ejecutará automáticamente en el arranque

### Paso 2: Acceder al Módulo

1. En el **Sidebar**, expande grupo **"Administración"**
2. Haz clic en **"Resguardo de Bienes"**
3. Deberías ver el formulario completo de 6 secciones

---

## ✅ Casos de Prueba

### **Caso 1: Crear Resguardo Completo**

#### Datos de Entrada:

```
SECCIÓN 1: Documento
- Folio: RSG-2024-001
- Fecha: (hoy)

SECCIÓN 2: Origen
- Nombre Planta: CEDES Central
- Código: CD-001
- Municipio: Mérida
- Dirección: Calle 1, #123

SECCIÓN 3: Responsables
- Entrega: Juan García López / Almacenero
- Transporta: Carlos Méndez / Lic-ABC-123
- Recibe: María Rodríguez / Encargada Resguardo

SECCIÓN 4: Bienes (Agregar 3)
Bien 1:
  - Inv#: INV-2024-001
  - Descripción: Escritorio Metálico
  - Cantidad: 1
  - Marca: IKEA
  - Modelo: Model-X
  - Serial: SER-001
  - Condición: BUENO

Bien 2:
  - Inv#: INV-2024-002
  - Descripción: Silla Giratoria
  - Cantidad: 5
  - Marca: Herman Miller
  - Condición: BUENO

Bien 3:
  - Inv#: INV-2024-003
  - Descripción: Monitor LG
  - Cantidad: 2
  - Serial: MON-LG-001
  - Condición: DAÑADO
```

#### Acciones:

1. Completa cada sección
2. Haz clic "+ Agregar Bien" para cada uno
3. Verifica que aparezcan en la tabla
4. Haz clic "Registrar Resguardo"

#### Resultado Esperado:

- ✅ Mensaje: "Resguardo RSG-2024-001 registrado exitosamente"
- ✅ Formulario se limpia
- ✅ Carrito se vacía
- ✅ Resguardo guardado en BD

---

### **Caso 2: Validación de Folio Duplicado**

#### Acciones:

1. Intenta crear otro resguardo con folio: **RSG-2024-001** (el mismo)
2. Completa otros datos
3. Haz clic "Registrar Resguardo"

#### Resultado Esperado:

- ❌ Error: "Este folio ya existe"
- Formulario permanece intacto
- No se guarda

---

### **Caso 3: Validación de Inventario Único en Carrito**

#### Acciones:

1. Intenta agregar 2 bienes con **Inv#: INV-2024-001**
2. Completa el primero y agrega
3. Completa el segundo con el mismo Inv# e intenta agregar

#### Resultado Esperado:

- ❌ Error: "Este número de inventario ya fue agregado"
- El bien NO se agrega al carrito

---

### **Caso 4: Validación de Serial Único**

#### Acciones:

1. Agrega bien con Serial#: **SER-SPECIAL**
2. Intenta agregar otro bien con el mismo Serial#

#### Resultado Esperado:

- ❌ Error: "Este número de serie ya fue agregado"
- El bien NO se agrega

---

### **Caso 5: Validación de Campos Obligatorios**

#### Acciones:

1. Intenta registrar sin llenar "Nombre de Planta"
2. O intenta registrar sin agregar bienes
3. O intenta registrar sin llenar un responsable

#### Resultado Esperado:

- ❌ Error con lista de campos faltantes
- Resguardo NO se guarda

---

### **Caso 6: Generar Comprobante en PDF**

#### Acciones:

1. Crea un resguardo (Caso 1)
2. Una vez guardado exitosamente
3. Haz clic "Generar Comprobante"
4. Se abre diálogo "Guardar como PDF"
5. Elige ubicación y nombre
6. Haz clic "Guardar"

#### Resultado Esperado:

- ✅ Mensaje: "Comprobante generado exitosamente"
- PDF se crea en la ubicación elegida
- PDF contiene:
  - Encabezado CEDES
  - Folio, fecha, estado
  - Datos del origen
  - Cadena de custodia (3 responsables)
  - Tabla de bienes
  - Totales

---

### **Caso 7: Estadísticas en Carrito**

#### Acciones:

1. Agrega 3 bienes como en Caso 1
2. Verifica la sección "Estadísticas" del carrito

#### Resultado Esperado:

- Total de Bienes: 3
- Cantidad Total: 8 (1+5+2)
- En Bueno: 2 (primer y segundo bien)
- Con Daños: 1 (tercer bien)

---

### **Caso 8: Eliminar Bien del Carrito**

#### Acciones:

1. Agrega varios bienes
2. En la tabla, haz clic en el icono de "papelera" (Trash)
3. Verifica que se elimine

#### Resultado Esperado:

- ✅ El bien se quita de la tabla
- Estadísticas se recalculan
- Cantidad total disminuye

---

### **Caso 9: Responsivo en Mobile**

#### Acciones:

1. Abre el inspector de navegador (F12)
2. Cambia a vista móvil (375px)
3. Navega por el formulario

#### Resultado Esperado:

- ✅ Formulario adapta a una columna
- Botones son clickeables
- Tabla es scrolleable horizontalmente
- Texto legible

---

## 🔍 Validaciones de BD

Puedes verificar los datos en la BD SQLite:

```sql
-- Ver resguardos creados
SELECT * FROM custody_entries;

-- Ver bienes de un resguardo
SELECT * FROM custody_items WHERE custody_entry_id = 1;

-- Contar resguardos
SELECT COUNT(*) FROM custody_entries;

-- Ver el último resguardo
SELECT * FROM custody_entries ORDER BY created_at DESC LIMIT 1;
```

---

## 🐛 Problemas Comunes

### Problema: "No aparece el módulo en Sidebar"

**Solución**:

- Verifica que estés logueado como **Admin**
- Usuarios normales no ven el módulo
- Recarga la página (F5)

### Problema: "Error al registrar: Cannot read property"

**Solución**:

- Verifica que todos los campos requeridos estén llenos
- Revisa la consola (F12) para detalles
- Intenta con datos simples primero

### Problema: "PDF no se genera"

**Solución**:

- Intenta generar después de guardar exitosamente
- Verifica que tengas permisos de escritura
- Revisa que jsPDF esté instalado (`npm list jspdf`)

### Problema: "Folio no valida"

**Solución**:

- Formato correcto: RSG-2024-001 (RSG-AAAA-###)
- No puede tener espacios
- Letras mayúsculas solo en "RSG"

---

## 📊 Datos de Prueba Recomendados

```javascript
// Folios para pruebas
RSG-2024-001
RSG-2024-002
RSG-2024-003

// Inventario#
INV-2024-001
INV-2024-002
INV-2024-003
INV-2024-004

// Serial# (opcional)
SER-001
SER-002
MON-LG-123

// Municipios
Mérida
Progreso
Valladolid
Cancún

// Responsables
Juan García López - Almacenero
Carlos Méndez Pérez - Transportista
María Rodríguez López - Encargada Custodia
```

---

## ✨ Checklist de Validación Final

- [ ] Folio se valida correctamente
- [ ] Bienes se agregan al carrito
- [ ] Estadísticas se calculan bien
- [ ] Validaciones muestran errores claros
- [ ] PDF se genera correctamente
- [ ] Datos se guardan en BD
- [ ] Sidebar muestra el enlace
- [ ] Responsivos en mobile
- [ ] Mensajes de éxito/error funcionan
- [ ] Transacciones son atómicas (todo o nada)

---

## 📞 Soporte

Si encuentras problemas:

1. Abre consola (F12)
2. Copia el mensaje de error
3. Revisa el archivo `src/modules/custody-entry/README.md`
4. Verifica que las migraciones se ejecutaron (`npm start`)

---

**¡Módulo listo para pruebas!** 🚀
