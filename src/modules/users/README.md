# Módulo de Gestión de Usuarios

Sistema completo de gestión de usuarios con autenticación y seguridad mediante bcrypt.

## 📁 Estructura del Módulo

```
users/
├── UsersView.jsx              # Vista principal de listado
├── hooks/
│   └── useUsers.js           # Hook para gestión de usuarios
├── components/
│   └── UsersTable.jsx        # Tabla de usuarios
└── README.md                  # Este archivo

auth/
├── LoginView.jsx             # Vista de login
├── RegisterView.jsx          # Vista de registro
└── hooks/
    └── useUserRegistration.js # Hook para registro
```

## 🎯 Características

### Gestión de Usuarios (UsersView)
- ✅ Lista completa de usuarios
- ✅ Búsqueda por nombre, username o rol
- ✅ Botón para crear nuevos usuarios
- ✅ Estadísticas: Total, activos, administradores
- ✅ Desactivación de usuarios (soft delete)
- ✅ Protección del admin principal (no se puede eliminar)

### Registro de Usuarios (RegisterView)
- ✅ Formulario completo con validaciones
- ✅ Campos:
  - Nombre completo (requerido)
  - Username (requerido, único, mín. 3 caracteres)
  - Contraseña (requerida, mín. 6 caracteres)
  - Confirmar contraseña (debe coincidir)
  - Rol (Cajero o Administrador)
  - Estado activo (checkbox)
- ✅ Visualización/ocultación de contraseñas
- ✅ Validaciones frontend y backend
- ✅ Mensajes de éxito/error
- ✅ Redirección automática después de crear

### Seguridad
- ✅ **Contraseñas hasheadas con bcrypt** (salt de 10 rondas)
- ✅ Nunca se almacenan contraseñas en texto plano
- ✅ Validación de username único
- ✅ Validación de longitudes mínimas
- ✅ Confirmación de contraseña
- ✅ No se puede eliminar el admin principal (ID: 1)

## 📋 Tabla de Base de Datos

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'cashier',  -- 'admin' | 'cashier'
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

## 🔐 Sistema de Roles

### Admin (Administrador)
- Acceso completo al sistema
- Puede crear/modificar usuarios
- Puede ver todos los reportes
- Acceso a configuración

### Cashier (Cajero)
- Puede realizar ventas
- Puede consultar productos
- Ver historial de sus propias ventas
- Acceso limitado

## 🔑 Usuario por Defecto

Al iniciar la aplicación por primera vez, se crea automáticamente:

```
Username: admin
Password: admin123
Rol: Administrador
```

**⚠️ IMPORTANTE**: Cambiar esta contraseña en producción.

## 🚀 API (IPC Handlers)

### `users:create`
Crea un nuevo usuario con contraseña hasheada.

**Input:**
```javascript
{
  name: string,
  username: string,
  password: string,       // Se hashea automáticamente
  role: 'admin' | 'cashier',
  active: 0 | 1
}
```

**Output:**
```javascript
{
  id: number,
  name: string,
  username: string,
  role: string,
  active: number
}
```

**Errores:**
- `El nombre de usuario ya existe`
- `Todos los campos son requeridos`
- `Error al crear usuario`

### `users:getAll`
Obtiene todos los usuarios (sin contraseñas).

**Output:**
```javascript
[
  {
    id: number,
    name: string,
    username: string,
    role: string,
    active: number,
    created_at: string
  }
]
```

### `users:update`
Actualiza un usuario existente.

**Input:** `(id: number, userData: object)`

**Nota:** Si se envía `password`, se hashea automáticamente.

### `users:delete`
Desactiva un usuario (soft delete).

**Input:** `(id: number)`

**Protección:** No permite eliminar el usuario ID 1.

### `users:login`
Valida credenciales y retorna datos del usuario.

**Input:**
```javascript
{
  username: string,
  password: string
}
```

**Output:**
```javascript
{
  id: number,
  name: string,
  username: string,
  role: string
}
```

**Errores:**
- `Usuario o contraseña incorrectos`
- `Usuario inactivo. Contacta al administrador`

## 🔧 Custom Hooks

### useUsers
Maneja la lógica de la vista de usuarios.

```javascript
const {
  users,          // Array filtrado
  allUsers,       // Array completo
  loading,        // boolean
  error,          // string | null
  searchTerm,     // string
  setSearchTerm,  // function
  deleteUser,     // (id) => Promise
  refreshUsers,   // () => Promise
} = useUsers();
```

### useUserRegistration
Maneja la lógica de registro.

```javascript
const {
  loading,        // boolean
  error,          // string | null
  success,        // boolean
  registerUser,   // (userData) => Promise
  clearMessages,  // () => void
} = useUserRegistration();
```

## ✅ Validaciones

### Frontend
- ✅ Nombre requerido
- ✅ Username mínimo 3 caracteres
- ✅ Username único
- ✅ Contraseña mínimo 6 caracteres
- ✅ Contraseñas deben coincidir
- ✅ Rol requerido

### Backend
- ✅ Validación de username único
- ✅ Hasheo automático de contraseñas con bcrypt
- ✅ Verificación de contraseñas con bcrypt.compare
- ✅ Protección del admin principal
- ✅ Manejo de errores descriptivos

## 🎨 Componentes

### UsersView
Vista principal con:
- Lista de usuarios
- Búsqueda en tiempo real
- Botón "Nuevo Usuario"
- Manejo de errores

### RegisterView
Formulario de registro con:
- Todos los campos necesarios
- Validación en tiempo real
- Botones de mostrar/ocultar contraseña
- Mensajes de éxito/error
- Navegación de regreso
- Panel informativo de seguridad

### UsersTable
Tabla responsive con:
- Avatar con inicial del nombre
- Badges de color para roles y estados
- Fecha de creación formateada
- Botón de desactivar (solo si no es admin principal)
- Footer con estadísticas

## 🔄 Flujo de Registro

1. Usuario administrador va a "Usuarios"
2. Click en "Nuevo Usuario"
3. Completa el formulario
4. Password se valida (mín. 6 caracteres)
5. Se confirma que las contraseñas coinciden
6. Backend hashea la contraseña con bcrypt
7. Se valida que el username sea único
8. Usuario se crea en la base de datos
9. Mensaje de éxito y redirección automática

## 🔒 Seguridad con bcrypt

### ¿Por qué bcrypt?
- ✅ Diseñado específicamente para contraseñas
- ✅ Resistente a ataques de fuerza bruta
- ✅ Salt automático por usuario
- ✅ Ajustable (10 rondas = buena seguridad/performance)

### Proceso de Hasheo
```javascript
// Al crear usuario
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);
// hash guardado: $2a$10$N9qo8uLOickgx2ZMRZoMye...

// Al validar login
const isValid = bcrypt.compareSync(password, hash);
```

### Seguridad de la Contraseña
- No se almacena en texto plano NUNCA
- Cada usuario tiene su propio salt único
- Imposible revertir el hash a la contraseña original
- 10 rondas de bcrypt ≈ 100ms de tiempo de cómputo

## 🚀 Cómo Usar

### Crear un nuevo usuario
1. Navega a `/users`
2. Click en "Nuevo Usuario"
3. Completa el formulario
4. Click en "Registrar Usuario"

### Ver usuarios
1. Navega a `/users`
2. Usa la búsqueda para filtrar
3. Click en desactivar para desactivar usuarios

### Login (próximamente integrado)
1. Usa el LoginView
2. Ingresa username y password
3. El sistema valida con bcrypt
4. Redirecciona si es correcto

## 🚧 Mejoras Futuras

- [ ] Edición de usuarios
- [ ] Cambio de contraseña (el propio usuario)
- [ ] Reset de contraseña (por admin)
- [ ] Logs de actividad por usuario
- [ ] Roles personalizados
- [ ] Permisos granulares
- [ ] Sesiones con tokens
- [ ] Bloqueo después de intentos fallidos
- [ ] Contraseñas con políticas (mayúsculas, símbolos, etc.)
- [ ] Foto de perfil

## 📝 Notas Importantes

1. **bcryptjs vs bcrypt**: Usamos `bcryptjs` (JavaScript puro) porque es más compatible con Electron que `bcrypt` (nativo en C++)

2. **Contraseña por defecto**: El admin tiene contraseña `admin123`. Cámbiala en producción.

3. **Soft delete**: Los usuarios no se eliminan, solo se desactivan (`active = 0`)

4. **ID 1 protegido**: El usuario con ID 1 no se puede eliminar para mantener integridad

5. **Salt rounds**: Usamos 10 rondas (equilibrio entre seguridad y performance)

## 🔐 Integración con Login

Para integrar el login real, actualiza `LoginView.jsx`:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const user = await window.api.users.login({ username, password });
    // Guardar sesión (localStorage, context, etc.)
    navigate('/sales');
  } catch (error) {
    setError(error.message);
  }
};
```

## 🎯 Para Probar

1. Reinicia la aplicación (para cargar el nuevo handler)
2. Elimina la base de datos si ya existe
3. Inicia la app (se crea admin con contraseña hasheada)
4. Navega a "Usuarios" en el sidebar
5. Click en "Nuevo Usuario"
6. Completa el formulario
7. ¡Usuario creado con contraseña segura!

La contraseña será hasheada automáticamente con bcrypt. 🔒



