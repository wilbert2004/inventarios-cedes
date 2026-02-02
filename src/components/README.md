# Componentes Compartidos

Esta carpeta contiene componentes reutilizables y de diseño general de la aplicación.

## Layout Component

El componente `Layout` proporciona la estructura principal de la aplicación con sidebar de navegación.

### 📋 Características

#### Sidebar Responsive
- **Desktop**: Sidebar fijo siempre visible
- **Mobile**: Sidebar colapsable con overlay
- **Toggle suave**: Animaciones de transición
- **Logo de la aplicación** con versión

#### Navegación
Incluye enlaces a las siguientes secciones:
- 🛒 **Punto de Venta** (`/sales`)
- 📦 **Productos** (`/products`)
- 📋 **Inventario** (`/inventory`) - Próximamente
- 📊 **Reportes** (`/reports`) - Próximamente
- ⚙️ **Configuración** (`/settings`) - Próximamente

#### Header Superior
- Botón de menú para móviles
- Información del usuario actual
- Avatar con iniciales

#### Características de Navegación
- **NavLink activo**: Resaltado visual de la ruta actual
- **Iconos SVG**: Cada sección tiene su ícono representativo
- **Hover states**: Feedback visual en interacciones
- **Transiciones suaves**: Animaciones CSS para cambios de estado

### 🎨 Diseño

#### Paleta de Colores
- **Primario**: Azul (#2563eb)
- **Activo**: Azul claro (#eff6ff)
- **Hover**: Gris claro (#f9fafb)
- **Peligro**: Rojo (#dc2626)

#### Iconografía
Todos los iconos utilizan `heroicons` (outline) mediante SVG inline para:
- Mejor rendimiento
- Control total del color
- Sin dependencias adicionales

### 🔧 Uso

El Layout se aplica automáticamente mediante rutas anidadas en `app.jsx`:

```jsx
<Route element={<Layout />}>
  <Route path="/sales" element={<SalesView />} />
  <Route path="/products" element={<ProductsView />} />
  {/* ... más rutas */}
</Route>
```

Las vistas hijas se renderizan en el `<Outlet />` del Layout.

### 📱 Responsive Breakpoints

- **Mobile**: < 1024px (sidebar colapsable)
- **Desktop**: ≥ 1024px (sidebar fijo)

### 🔐 Características de Seguridad

- Confirmación antes de cerrar sesión
- Redirección al login al cerrar sesión
- Protección de rutas (próximamente)

### 🚀 Funcionalidades Futuras

- [ ] Autenticación real con tokens
- [ ] Múltiples roles de usuario
- [ ] Notificaciones en tiempo real
- [ ] Tema oscuro
- [ ] Personalización del sidebar
- [ ] Breadcrumbs en el header
- [ ] Búsqueda global
- [ ] Atajos de teclado

### 🎯 Buenas Prácticas Implementadas

1. **Separation of Concerns**: El Layout solo maneja la estructura
2. **Componentes Funcionales**: 100% React Hooks
3. **Accesibilidad**: Uso de elementos semánticos
4. **Performance**: SVG inline sin librerías externas
5. **Mobile First**: Diseño responsive desde el inicio
6. **DRY**: NavLinks con lógica reutilizable
7. **Consistencia**: Estilos uniformes en toda la app

### 📝 Notas Técnicas

- El sidebar usa `position: fixed` en móvil y `position: static` en desktop
- El overlay en móvil usa z-index para estar sobre el contenido
- Las transiciones CSS usan `transform` para mejor performance
- El `<Outlet />` permite que las rutas hijas se rendericen en el área principal

