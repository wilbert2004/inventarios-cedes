# Sistema de Licencias - Absolute POS

## Documentación para Generación de Licencias

Esta documentación explica cómo generar licencias para el sistema Absolute POS. El sistema utiliza un método de licenciamiento basado en hardware fingerprint, donde cada instalación tiene un ID único y requiere una licencia específica.

---

## Tabla de Contenidos

1. [Conceptos Básicos](#conceptos-básicos)
2. [Obtener el Hardware ID](#obtener-el-hardware-id)
3. [Generar una Licencia](#generar-una-licencia)
4. [Proceso Completo de Activación](#proceso-completo-de-activación)
5. [Solución de Problemas](#solución-de-problemas)
6. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Conceptos Básicos

### ¿Qué es un Hardware ID?

El Hardware ID es un identificador único generado para cada instalación del sistema. Se crea combinando características del sistema:

- Hostname de la computadora
- Plataforma del sistema operativo (Windows, macOS, Linux)
- Arquitectura del procesador
- Memoria total del sistema
- Número de procesadores

Este ID garantiza que cada instalación sea única y que las licencias no puedan transferirse entre diferentes computadoras.

### ¿Cómo Funciona el Sistema de Licencias?

1. **Primera Instalación**: Al instalar y acceder por primera vez, el sistema genera automáticamente un Hardware ID único.

2. **Período de Demo**: El sistema otorga 14 días de uso gratuito desde el primer acceso.

3. **Activación**: Para continuar usando el sistema después del demo, se requiere una licencia válida generada específicamente para ese Hardware ID.

4. **Verificación Local**: Todo el proceso de verificación se realiza localmente, sin necesidad de conexión a internet.

---

## Obtener el Hardware ID

### Método 1: Desde la Interfaz del Sistema

1. El cliente debe iniciar sesión en el sistema.
2. Navegar a la sección **"Licencia"** en el menú lateral (dentro de Configuración).
3. Hacer clic en el botón **"Mostrar Hardware ID"**.
4. Copiar el ID que se muestra (formato: 32 caracteres alfanuméricos).

**Ejemplo de Hardware ID:**
```
A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

### Método 2: Solicitar al Cliente

Si el cliente no puede acceder al sistema (por ejemplo, si el demo expiró), puedes pedirle que:

1. Abra la base de datos SQLite del sistema (ubicada en `AppData/Roaming/absolute-pos-app/pos.db`).
2. Ejecute la consulta:
   ```sql
   SELECT hardware_id FROM license LIMIT 1;
   ```
3. Te proporcione el resultado.

---

## Generar una Licencia

### Requisitos Previos

- Node.js instalado en tu computadora de desarrollo
- Acceso al script de generación de licencias
- El Hardware ID del cliente

### Pasos para Generar una Licencia

#### 1. Abrir Terminal/Consola

Navega a la raíz del proyecto Absolute POS.

#### 2. Ejecutar el Script de Generación

Usa el siguiente comando, reemplazando `<hardware-id>` con el Hardware ID del cliente:

```bash
node scripts/generate-license.js <hardware-id>
```

**Ejemplo:**
```bash
node scripts/generate-license.js A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
```

#### 3. Obtener la Licencia

El script mostrará la salida en la consola:

```
✅ Licencia generada exitosamente

Hardware ID:
  A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6

Clave de Licencia:
  A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6

─────────────────────────────────────────
```

#### 4. Formato de la Licencia

La licencia generada tiene el formato:
```
XXXX-XXXX-XXXX-XXXX-XXXX
```

Donde cada `X` es un carácter hexadecimal (0-9, A-F).

**Ejemplo de licencia válida:**
```
A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6
```

---

## Proceso Completo de Activación

### Para el Desarrollador

1. **Recibir solicitud del cliente**
   - El cliente solicita una licencia (puede ser antes o después de que expire el demo).

2. **Obtener Hardware ID**
   - Solicitar al cliente el Hardware ID usando uno de los métodos descritos anteriormente.

3. **Generar la licencia**
   - Ejecutar el script de generación con el Hardware ID proporcionado.
   - Copiar la licencia generada.

4. **Entregar la licencia al cliente**
   - Proporcionar la licencia al cliente de forma segura (email, mensaje, etc.).
   - Incluir instrucciones de activación si es necesario.

### Para el Cliente

1. **Acceder a la sección de Licencia**
   - Iniciar sesión en el sistema.
   - Navegar a **Configuración → Licencia**.

2. **Ingresar la licencia**
   - En el campo "Clave de Licencia", ingresar la licencia proporcionada.
   - La licencia puede ingresarse con o sin guiones (el sistema los normaliza automáticamente).

3. **Activar**
   - Hacer clic en el botón **"Activar Licencia"**.
   - Si la licencia es válida, se mostrará un mensaje de éxito.

4. **Confirmación**
   - El sistema mostrará el estado "Licencia Activada".
   - Se mostrará la fecha de activación.
   - El sistema funcionará sin restricciones.

---

## Solución de Problemas

### Error: "Licencia inválida para esta instalación"

**Causa:** La licencia no corresponde al Hardware ID de esta instalación.

**Solución:**
1. Verificar que el Hardware ID sea correcto.
2. Regenerar la licencia con el Hardware ID correcto.
3. Asegurarse de que el cliente esté ingresando la licencia completa y sin errores.

### Error: "Hardware ID es requerido"

**Causa:** No se proporcionó el Hardware ID al ejecutar el script.

**Solución:**
- Asegurarse de incluir el Hardware ID como argumento:
  ```bash
  node scripts/generate-license.js <hardware-id>
  ```

### El demo no inicia automáticamente

**Causa:** Puede haber un problema con la base de datos o la migración.

**Solución:**
1. Verificar que la tabla `license` existe en la base de datos.
2. Revisar los logs del proceso principal de Electron.
3. Ejecutar manualmente la migración si es necesario.

### La licencia no se activa

**Posibles causas y soluciones:**

1. **Licencia con formato incorrecto**
   - Verificar que la licencia tenga el formato correcto: `XXXX-XXXX-XXXX-XXXX-XXXX`
   - El sistema acepta la licencia con o sin guiones, pero debe tener 32 caracteres hexadecimales.

2. **Hardware ID incorrecto**
   - Verificar que el Hardware ID usado para generar la licencia sea el correcto.
   - Solicitar nuevamente el Hardware ID al cliente y regenerar la licencia.

3. **Clave secreta diferente**
   - Asegurarse de que la clave secreta en `src/main/services/license.service.js` sea la misma usada para generar la licencia.
   - En producción, usar una clave secreta única y mantenerla consistente.

### El sistema redirige constantemente a la página de licencia

**Causa:** El sistema detecta que no hay licencia activa y el demo expiró.

**Solución:**
1. Verificar el estado de la licencia en la base de datos.
2. Si la licencia está activada pero el sistema no la reconoce, verificar que:
   - El campo `license_key` no esté vacío.
   - El campo `activated_at` tenga una fecha válida.
   - El campo `is_active` sea `1`.

---

## Preguntas Frecuentes

### ¿Puedo usar la misma licencia en múltiples computadoras?

**No.** Cada instalación tiene un Hardware ID único, y cada licencia es específica para un Hardware ID. Si un cliente necesita usar el sistema en múltiples computadoras, necesitará una licencia para cada una.

### ¿Qué pasa si el cliente cambia de computadora?

Si el cliente cambia de computadora, se generará un nuevo Hardware ID. El cliente necesitará una nueva licencia generada con el nuevo Hardware ID.

### ¿La licencia expira?

No, una vez activada, la licencia no expira. Sin embargo, está vinculada al Hardware ID específico de la instalación.

### ¿Puedo transferir una licencia a otra computadora?

No directamente. Si el cliente necesita usar el sistema en otra computadora, debe:
1. Obtener el nuevo Hardware ID de la nueva computadora.
2. Solicitar una nueva licencia generada con el nuevo Hardware ID.

### ¿Qué pasa si el cliente reinstala el sistema?

Si el cliente reinstala el sistema en la misma computadora:
- El Hardware ID debería ser el mismo (basado en características del hardware).
- La licencia previamente activada debería seguir funcionando.
- Si se restaura desde un backup, la información de licencia se mantiene.

### ¿Necesito conexión a internet para activar la licencia?

**No.** Todo el proceso de verificación de licencias se realiza localmente. No se requiere conexión a internet.

### ¿Cómo puedo ver todas las licencias generadas?

Actualmente, el sistema no mantiene un registro centralizado de licencias generadas. Se recomienda mantener un registro manual de:
- Hardware ID del cliente
- Licencia generada
- Fecha de generación
- Cliente asociado

### ¿Puedo revocar una licencia?

El sistema actual no incluye funcionalidad de revocación automática. Si necesitas revocar una licencia, puedes:
1. Modificar directamente la base de datos del cliente (no recomendado).
2. Implementar una funcionalidad de revocación en futuras versiones.

### ¿Qué debo hacer si olvidé la clave secreta?

Si olvidas o cambias la clave secreta:
- Las licencias generadas con la clave anterior dejarán de funcionar.
- Necesitarás regenerar todas las licencias con la nueva clave.
- **Recomendación:** Mantén la clave secreta en un lugar seguro y documentado.

---

## Seguridad

### Clave Secreta

La clave secreta se encuentra en:
```
src/main/services/license.service.js
```

**IMPORTANTE:**
- Mantén esta clave en secreto.
- No la compartas públicamente.
- En producción, usa una clave única y segura.
- Documenta dónde se almacena para referencia futura.

### Mejores Prácticas

1. **Almacenamiento seguro**: Mantén un registro seguro de Hardware IDs y licencias generadas.

2. **Validación**: Siempre verifica el Hardware ID antes de generar una licencia.

3. **Documentación**: Mantén un registro de:
   - Cliente
   - Hardware ID
   - Licencia generada
   - Fecha de generación
   - Fecha de activación (si está disponible)

4. **Backup**: Considera hacer backup de tu registro de licencias.

---

## Ejemplos de Uso

### Ejemplo 1: Cliente Nuevo

1. Cliente instala el sistema.
2. Cliente inicia sesión por primera vez (demo inicia automáticamente).
3. Cliente solicita licencia antes de que expire el demo.
4. Desarrollador solicita Hardware ID.
5. Cliente proporciona: `B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7`
6. Desarrollador ejecuta:
   ```bash
   node scripts/generate-license.js B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7
   ```
7. Desarrollador obtiene: `B2C3D4E5-F6G7-H8I9-J0K1-L2M3N4O5P6Q7`
8. Desarrollador entrega la licencia al cliente.
9. Cliente activa la licencia en el sistema.

### Ejemplo 2: Demo Expirado

1. Cliente intenta usar el sistema después de 14 días.
2. Sistema redirige automáticamente a la página de licencia.
3. Cliente solicita licencia al desarrollador.
4. Desarrollador solicita Hardware ID.
5. Cliente accede a la página de licencia y obtiene el Hardware ID.
6. Desarrollador genera y entrega la licencia.
7. Cliente activa la licencia y puede continuar usando el sistema.

---

## Contacto y Soporte

Para problemas o preguntas sobre el sistema de licencias:

- Revisa esta documentación primero.
- Consulta los logs del sistema.
- Verifica la configuración de la base de datos.
- Contacta al equipo de desarrollo si el problema persiste.

---

**Última actualización:** 2024

**Versión del sistema:** 1.0.0
