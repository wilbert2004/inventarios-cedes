# 🔐 Sistema de Autenticación Integrado

El sistema ahora cuenta con autenticación completa usando bcrypt, Context API y protección de rutas.

## ✅ ¿Qué se Implementó?

### 1. **Autenticación Real con bcrypt**
- ✅ Contraseñas hasheadas con bcrypt (10 rondas)
- ✅ Validación segura de credenciales
- ✅ Login real con base de datos

### 2. **Context API para Estado Global**
- ✅ `AuthContext` maneja el estado de autenticación
- ✅ Hook `useAuth()` disponible en toda la app
- ✅ Persistencia con localStorage

### 3. **Protección de Rutas**
- ✅ `ProtectedRoute` protege todas las rutas excepto login
- ✅ Redirección automática si no está autenticado
- ✅ Verificación de sesión al cargar

### 4. **Gestión de Usuarios**
- ✅ Vista de usuarios (`/users`)
- ✅ Formulario de registro (`/users/register`)
- ✅ CRUD completo de usuarios
- ✅ Roles: Admin y Cajero

### 5. **UI Actualizada**
- ✅ Login muestra errores de autenticación
- ✅ Layout muestra usuario actual
- ✅ Logout limpia sesión correctamente
- ✅ Spinner mientras valida

## 🚀 Cómo Iniciar

### 1. Reiniciar la Aplicación

```bash
# En la terminal donde corre npm start
Ctrl + C

# Luego
npm start
```

### 2. Eliminar Base de Datos Anterior (Importante)

Para que se cree el usuario con contraseña hasheada:

**Windows:**
```
1. Presiona Win + R
2. Escribe: %APPDATA%\absolute-pos-app
3. Elimina: pos.db, pos.db-shm, pos.db-wal
```

**macOS/Linux:**
```bash
rm ~/.config/absolute-pos-app/pos.db*
# o
rm ~/Library/Application\ Support/absolute-pos-app/pos.db*
```

### 3. Iniciar la App

```bash
npm start
```

Se creará automáticamente:
- Base de datos con todas las tablas
- Usuario administrador con contraseña hasheada

## 🔑 Credenciales por Defecto

```
Usuario: admin
Contraseña: admin123
Rol: Administrador
```

Estas credenciales se muestran en la pantalla de login.

## 📊 Flujo Completo

### 🔓 Login
1. Abre la aplicación
2. Ingresa: `admin` / `admin123`
3. Click en "Iniciar Sesión"
4. El sistema:
   - Valida credenciales con bcrypt
   - Guarda usuario en Context y localStorage
   - Redirige a `/sales`

### 🏠 Navegación
5. En el sidebar, verás:
   - Tu nombre y rol en el header
   - Todas las opciones disponibles
6. Navega libremente por la app

### 👥 Crear Usuarios
7. Click en "Usuarios" en el sidebar
8. Click en "Nuevo Usuario"
9. Completa el formulario:
   - Nombre: "Juan Pérez"
   - Username: "juanperez"
   - Contraseña: "123456" (o la que quieras)
   - Confirmar contraseña
   - Rol: Cajero o Admin
10. Click en "Registrar Usuario"
11. La contraseña se hashea automáticamente

### 🚪 Logout
12. Click en "Cerrar Sesión" en el sidebar
13. Confirma
14. Se limpia la sesión y redirige al login

### 🔄 Persistencia
15. Si recargas la página (F5):
    - La sesión se mantiene
    - No necesitas volver a hacer login
    - Funciona porque está en localStorage

## 🔒 Seguridad Implementada

### Contraseñas
- ✅ Hasheadas con bcrypt (salt de 10 rondas)
- ✅ Nunca se almacenan en texto plano
- ✅ Validación segura con bcrypt.compareSync()

### Sesiones
- ✅ Usuario guardado en Context y localStorage
- ✅ Verificación al cargar la app
- ✅ Limpieza automática al hacer logout

### Rutas
- ✅ Todas las rutas protegidas excepto login
- ✅ Redirección automática si no está autenticado
- ✅ Verificación antes de renderizar

### Usuarios
- ✅ Username único (constraint en BD)
- ✅ Admin principal protegido (no se puede eliminar)
- ✅ Validación de longitudes mínimas

## 📋 Estructura de Usuario en Sesión

```javascript
// Datos guardados en Context y localStorage
{
  id: 1,
  name: "Administrador",
  username: "admin",
  role: "admin"  // o "cashier"
}

// La contraseña NO se guarda en ningún lado del frontend
```

## 🎯 Usar en Componentes

### Obtener Usuario Actual
```javascript
const { user } = useAuth();

console.log(user.id);     // 1
console.log(user.name);   // "Administrador"
console.log(user.role);   // "admin"
```

### Verificar Rol
```javascript
const { isAdmin } = useAuth();

if (isAdmin()) {
  // Mostrar opciones de admin
}
```

### Login
```javascript
const { login } = useAuth();

const result = await login({ username, password });
if (result.success) {
  // Login exitoso
} else {
  // Mostrar error: result.error
}
```

### Logout
```javascript
const { logout } = useAuth();

logout(); // Limpia todo
navigate('/'); // Redirige al login
```

## 🔧 Integración con Backend

### En SalesView (usar ID del usuario)
```javascript
const { user } = useAuth();

const saleData = {
  userId: user.id,  // ← Ahora usa el usuario real
  total: total,
  items: cart.map(...)
};
```

### En RegisterView
```javascript
// Ya está integrado
// Al crear usuario, el password se hashea automáticamente
```

## 🚧 Mejoras Futuras

### Sesiones Más Seguras
- [ ] Tokens JWT en lugar de localStorage
- [ ] Refresh tokens
- [ ] Expiración automática de sesión (8 horas)
- [ ] Validación de token en cada llamada IPC

### Control de Acceso
- [ ] Permisos granulares por módulo
- [ ] Restricciones por rol en el backend
- [ ] Logs de acceso y auditoría

### Experiencia de Usuario
- [ ] "Recordarme" funcional
- [ ] Cambio de contraseña
- [ ] Recuperación de contraseña
- [ ] Bloqueo después de intentos fallidos

## ⚠️ Importante para Producción

1. **Cambiar contraseña por defecto**
   ```javascript
   // En seeds.js, cambiar:
   const passwordHash = bcrypt.hashSync("TU_PASSWORD_SEGURO", salt);
   ```

2. **No mostrar credenciales en el login**
   ```javascript
   // Eliminar el panel de credenciales en LoginView.jsx
   ```

3. **Implementar tokens JWT**
   - Más seguro que localStorage
   - Expiración automática
   - Validación en backend

4. **HTTPS en producción**
   - Nunca transmitir credenciales sin cifrado

## 🎉 ¡Listo!

El sistema ahora tiene:
- ✅ Login real con validación de contraseñas
- ✅ Sesiones persistentes
- ✅ Rutas protegidas
- ✅ Gestión completa de usuarios
- ✅ Usuario actual visible en toda la app
- ✅ Logout funcional

**Reinicia la app y elimina la base de datos para empezar con el sistema de autenticación completo!** 🚀



