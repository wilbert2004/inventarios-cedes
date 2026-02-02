# Módulo de Perfil de Usuario

Vista para que el usuario actual pueda ver y actualizar su información personal.

## 🎯 Características

### Información del Perfil
- ✅ Ver nombre completo
- ✅ Ver nombre de usuario
- ✅ Ver rol (Administrador/Cajero)
- ✅ Ver fecha de creación de cuenta
- ✅ Avatar con inicial del nombre

### Edición de Datos
- ✅ Actualizar nombre completo
- ✅ Actualizar nombre de usuario (con validación de unicidad)
- ✅ Validación en tiempo real
- ✅ Indicador de cambios pendientes
- ✅ Botón de cancelar cambios

### Acciones Rápidas
- ✅ Enlace directo a cambio de contraseña
- ✅ Navegación fácil desde el header

## 📋 Estructura del Módulo

```
profile/
├── ProfileView.jsx    # Vista principal del perfil
└── README.md          # Este archivo
```

## 🚀 Funcionalidades

### Ver Perfil
- Muestra información completa del usuario actual
- Avatar con inicial del nombre
- Badge de rol con color
- Fecha de creación formateada

### Editar Perfil
- Formulario con validación
- Actualización en tiempo real del contexto
- Sincronización con localStorage
- Mensajes de éxito/error

### Validaciones
- **Nombre**: Requerido, mínimo 2 caracteres
- **Username**: Requerido, mínimo 3 caracteres, solo letras/números/guiones bajos, único

## 🔄 Flujo de Trabajo

### Ver Perfil
1. Usuario hace click en su nombre o avatar en el header
2. Se muestra la vista de perfil con toda la información
3. Puede ver su rol, fecha de creación, etc.

### Editar Perfil
1. Usuario modifica nombre o username
2. Sistema valida en tiempo real
3. Click en "Guardar Cambios"
4. Sistema actualiza en la base de datos
5. Contexto de autenticación se actualiza automáticamente
6. Mensaje de éxito

### Cambiar Contraseña
1. Click en "Cambiar Contraseña" en el panel lateral
2. Redirección a vista de cambio de contraseña
3. Usuario cambia su contraseña
4. Regresa al perfil

## 📝 Campos Editables

### Nombre Completo
- **Tipo**: Texto
- **Requerido**: Sí
- **Mínimo**: 2 caracteres
- **Validación**: No puede estar vacío

### Nombre de Usuario
- **Tipo**: Texto
- **Requerido**: Sí
- **Mínimo**: 3 caracteres
- **Formato**: Solo letras, números y guiones bajos
- **Unicidad**: Debe ser único en el sistema

### Rol
- **Tipo**: Solo lectura
- **No editable**: El rol no se puede cambiar desde el perfil
- **Solo administradores** pueden cambiar roles desde la vista de usuarios

## 🔧 Integración con AuthContext

El módulo se integra con `AuthContext` para:

1. **Obtener usuario actual**: `const { user } = useAuth()`
2. **Actualizar usuario**: `updateUser(updatedUserData)`
3. **Sincronización automática**: Los cambios se reflejan inmediatamente en toda la app

```javascript
// En ProfileView
const { user, updateUser } = useAuth();

// Después de actualizar
const updatedUser = await window.api.users.update(user.id, {
  name: formData.name,
  username: formData.username,
  role: user.role,
  active: user.active,
});

// Actualizar contexto
updateUser(updatedUser);
```

## 🎨 Interfaz de Usuario

### Panel Lateral
- Avatar grande con inicial
- Nombre del usuario
- Badge de rol
- Información adicional (username, fecha)
- Botón de cambio de contraseña

### Panel Principal
- Formulario de edición
- Campos con validación visual
- Indicador de cambios pendientes
- Botones de acción (Cancelar/Guardar)

### Estados Visuales
- **Campo válido**: Borde gris
- **Campo inválido**: Borde rojo + mensaje de error
- **Cambios pendientes**: Botón "Guardar" habilitado
- **Sin cambios**: Botón "Guardar" deshabilitado
- **Guardando**: Spinner + texto "Guardando..."

## 🔒 Seguridad

- ✅ Solo el usuario actual puede editar su propio perfil
- ✅ Validación de unicidad de username en backend
- ✅ No se puede cambiar el rol desde el perfil
- ✅ Actualización segura mediante IPC handlers
- ✅ Sincronización con contexto de autenticación

## 📱 Navegación

### Desde el Header
- Click en el nombre del usuario → Perfil
- Click en el avatar → Perfil
- Click en el ícono de llave → Cambiar contraseña

### Desde el Perfil
- Botón "Volver" → Página anterior
- Botón "Cambiar Contraseña" → Vista de cambio de contraseña

## 🚧 Mejoras Futuras

- [ ] Foto de perfil personalizada
- [ ] Historial de cambios
- [ ] Preferencias de usuario (tema, idioma, etc.)
- [ ] Notificaciones de perfil
- [ ] Exportar datos del usuario
- [ ] Configuración de privacidad
