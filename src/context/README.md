# Context API - Autenticación

Sistema de autenticación global usando React Context API.

## 📁 Estructura

```
context/
├── AuthContext.jsx    # Context de autenticación
└── README.md         # Este archivo
```

## 🔐 AuthContext

Context global para manejar el estado de autenticación en toda la aplicación.

### Provider

```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

El `AuthProvider` debe envolver toda la aplicación en el nivel más alto (después del Router).

## 🎯 Hook: useAuth()

Hook personalizado para acceder al contexto de autenticación.

### Uso

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, login, logout, isAuthenticated, isAdmin } = useAuth();
  
  // Usar funciones y estado
}
```

### API del Hook

#### Estados

```javascript
{
  user: {
    id: number,
    name: string,
    username: string,
    role: 'admin' | 'cashier'
  } | null,
  
  loading: boolean,  // true mientras carga el usuario de localStorage
}
```

#### Funciones

**login(credentials)**
```javascript
const result = await login({ username, password });

// Resultado:
{
  success: boolean,
  user?: User,
  error?: string
}
```

**logout()**
```javascript
logout(); // Limpia el estado y localStorage
```

**isAuthenticated()**
```javascript
const authenticated = isAuthenticated(); // boolean
```

**isAdmin()**
```javascript
const admin = isAdmin(); // boolean
```

## 💾 Persistencia

El usuario se guarda en `localStorage` para mantener la sesión:

```javascript
// Al hacer login
localStorage.setItem('currentUser', JSON.stringify(userData));

// Al cargar la app
const storedUser = localStorage.getItem('currentUser');

// Al hacer logout
localStorage.removeItem('currentUser');
```

## 🛡️ ProtectedRoute

Componente para proteger rutas que requieren autenticación.

### Uso

```jsx
<Route
  element={
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  }
>
  <Route path="/sales" element={<SalesView />} />
  {/* Más rutas protegidas */}
</Route>
```

### Comportamiento

1. **Usuario autenticado**: Renderiza los children
2. **Usuario no autenticado**: Redirige a `/` (login)
3. **Verificando**: Muestra spinner de carga

## 🔄 Flujo de Autenticación

### Login
```
1. Usuario ingresa credenciales
   ↓
2. LoginView llama a login({ username, password })
   ↓
3. AuthContext llama a window.api.users.login()
   ↓
4. Backend valida con bcrypt.compareSync()
   ↓
5. Si es válido:
   - Guarda usuario en state
   - Guarda en localStorage
   - Retorna success: true
   ↓
6. LoginView navega a /sales
   ↓
7. ProtectedRoute permite el acceso
```

### Logout
```
1. Usuario hace click en "Cerrar Sesión"
   ↓
2. Layout muestra confirmación
   ↓
3. Si confirma, llama a logout()
   ↓
4. AuthContext:
   - Limpia state (user = null)
   - Limpia localStorage
   ↓
5. Layout navega a /
   ↓
6. ProtectedRoute detecta no autenticado
   ↓
7. Redirige a login automáticamente
```

### Recarga de Página
```
1. Usuario recarga la página (F5)
   ↓
2. AuthContext se monta
   ↓
3. useEffect carga usuario desde localStorage
   ↓
4. Si existe:
   - Establece user en el state
   - Usuario sigue autenticado
   ↓
5. Si no existe:
   - user = null
   - ProtectedRoute redirige a login
```

## 🎨 Integración en Componentes

### En Layout (mostrar usuario actual)
```jsx
const { user, logout } = useAuth();

return (
  <div>
    <p>{user.name}</p>
    <p>{user.role === 'admin' ? 'Administrador' : 'Cajero'}</p>
    <button onClick={logout}>Cerrar Sesión</button>
  </div>
);
```

### En LoginView (iniciar sesión)
```jsx
const { login, isAuthenticated } = useAuth();

const handleSubmit = async (e) => {
  e.preventDefault();
  const result = await login({ username, password });
  
  if (result.success) {
    navigate('/sales');
  } else {
    setError(result.error);
  }
};
```

### En Cualquier Vista (obtener usuario)
```jsx
const { user } = useAuth();

// Usar ID del usuario para operaciones
const saleData = {
  userId: user.id,
  // ...
};
```

## 🔒 Seguridad

### Lo que SÍ hace
- ✅ Valida credenciales con bcrypt
- ✅ Persiste sesión en localStorage
- ✅ Protege rutas del frontend
- ✅ Muestra usuario actual

### Lo que NO hace (futuras mejoras)
- ❌ Tokens JWT
- ❌ Refresh tokens
- ❌ Expiración de sesión
- ❌ Protección backend (todos los IPC son accesibles)
- ❌ Rate limiting de intentos de login
- ❌ Registro de auditoría de login

### Recomendaciones para Producción

1. **Implementar tokens JWT**
```javascript
// Enviar token en cada llamada IPC
window.api.products.getAll(token)
```

2. **Expiración de sesión**
```javascript
// Guardar timestamp y validar
const loginTime = Date.now();
const expired = Date.now() - loginTime > 8 * 60 * 60 * 1000; // 8 horas
```

3. **Validar token en backend**
```javascript
// En cada handler IPC
const isValid = verifyToken(token);
if (!isValid) throw new Error('Sesión expirada');
```

## 🚀 Testing

### Probar Login
1. Usuario: `admin`
2. Password: `admin123`
3. Debe iniciar sesión y redirigir a /sales

### Probar Protección de Rutas
1. Sin iniciar sesión, intenta navegar a `/sales`
2. Debe redirigir automáticamente a `/`

### Probar Persistencia
1. Inicia sesión
2. Recarga la página (F5)
3. Debe mantener la sesión

### Probar Logout
1. Inicia sesión
2. Click en "Cerrar Sesión"
3. Confirma
4. Debe redirigir a login

## 📝 Notas Técnicas

- **localStorage** se usa para persistencia (alternativa: sessionStorage, cookies)
- **Context API** distribuye el estado a todos los componentes
- **ProtectedRoute** usa `Navigate` de react-router-dom para redirecciones
- **Loading state** previene renderizado mientras verifica sesión

## 🎯 Ventajas de esta Arquitectura

1. **Centralizada**: Todo el estado de auth en un solo lugar
2. **Reutilizable**: Cualquier componente puede acceder con useAuth()
3. **Automática**: Carga del localStorage automática
4. **Protegida**: ProtectedRoute previene acceso no autorizado
5. **Limpia**: Logout limpia todo automáticamente



