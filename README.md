# 🛒 Absolute POS App

Sistema de Punto de Venta (POS) completo desarrollado con Electron, React y SQLite.

## 📋 Características

- ✅ **Punto de Venta**: Interfaz rápida para realizar ventas con búsqueda por código de barras
- ✅ **Gestión de Productos**: CRUD completo con búsqueda, filtrado y códigos de barras
- ✅ **Inventario**: Control de stock en tiempo real
- ✅ **Base de datos local**: SQLite embebida (sin servidor externo)
- ✅ **Interfaz moderna**: Diseño responsivo con Tailwind CSS
- ✅ **Desktop App**: Multiplataforma (Windows, macOS, Linux)

## 🚀 Instalación y Configuración

### Requisitos Previos

- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **npm** v9 o superior (viene con Node.js)
- **Git** (opcional, para clonar el repositorio)

### Pasos de Instalación

1. **Clonar el repositorio** (o descargar el ZIP):
```bash
git clone <url-del-repo>
cd absolute-pos-app
```

2. **Instalar dependencias**:
```bash
npm install
```

> ⚠️ **Importante**: El comando `npm install` automáticamente:
> - Instalará todas las dependencias de Node.js
> - Ejecutará `electron-rebuild` para compilar módulos nativos (`better-sqlite3`)
> - Esto puede tardar 2-3 minutos la primera vez

3. **Iniciar la aplicación**:
```bash
npm start
```

¡Eso es todo! La aplicación se abrirá automáticamente y la base de datos SQLite se creará en la primera ejecución.

## 📁 Ubicación de la Base de Datos

La base de datos SQLite se crea automáticamente en:

- **Windows**: `C:\Users\<usuario>\AppData\Roaming\absolute-pos-app\pos.db`
- **macOS**: `~/Library/Application Support/absolute-pos-app/pos.db`
- **Linux**: `~/.config/absolute-pos-app/pos.db`

## 🛠️ Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Empaquetar la aplicación para distribución
npm run package

# Crear instaladores para la plataforma actual
npm run make

# Reconstruir módulos nativos manualmente (si hay problemas)
npx electron-rebuild
```

## 📦 Tecnologías Utilizadas

### Frontend
- **React 19** - Framework UI
- **React Router v7** - Navegación
- **Tailwind CSS v3** - Estilos

### Backend
- **Electron 39** - Framework desktop
- **better-sqlite3** - Base de datos SQLite
- **Node.js** - Runtime

### Build Tools
- **Webpack 5** - Empaquetador
- **Babel** - Transpilador
- **Electron Forge** - Builder y packager

## 🏗️ Estructura del Proyecto

```
absolute-pos-app/
├── src/
│   ├── components/           # Componentes compartidos
│   │   └── Layout.jsx       # Layout principal con sidebar
│   ├── modules/             # Módulos de la aplicación
│   │   ├── auth/           # Autenticación
│   │   ├── sales/          # Punto de venta
│   │   └── products/       # Gestión de productos
│   │       ├── components/ # Componentes del módulo
│   │       ├── hooks/      # Custom hooks
│   │       └── ProductsView.jsx
│   ├── main/                # Proceso principal de Electron
│   │   ├── db/             # Base de datos
│   │   │   ├── connection.js
│   │   │   ├── migrations.js
│   │   │   └── tables.js
│   │   └── ipc/            # Handlers IPC
│   │       ├── products.ipc.js
│   │       └── sales.ipc.js
│   ├── app.jsx             # Configuración de rutas
│   ├── main.js             # Entrada del proceso principal
│   ├── preload.js          # Script preload (Bridge)
│   ├── renderer.js         # Entrada del proceso renderer
│   └── index.css           # Estilos globales
├── webpack.*.config.js      # Configuración de Webpack
├── tailwind.config.js       # Configuración de Tailwind
├── postcss.config.js        # Configuración de PostCSS
└── package.json
```

## 🔧 Solución de Problemas

### Error: "Cannot find module better-sqlite3"

Si obtienes este error después de `npm install`:

```bash
# Reconstruir módulos nativos manualmente
npx electron-rebuild

# Si persiste, reinstalar better-sqlite3
npm uninstall better-sqlite3
npm install better-sqlite3
npx electron-rebuild
```

### Error: "EPERM: operation not permitted"

En Windows, algunos antivirus bloquean la instalación. Soluciones:

1. Ejecutar la terminal como **Administrador**
2. Agregar la carpeta del proyecto a exclusiones del antivirus
3. Cerrar el editor de código antes de instalar

### La aplicación no inicia

1. Verificar que Node.js está instalado:
```bash
node --version  # Debe ser v18+
npm --version   # Debe ser v9+
```

2. Limpiar caché y reinstalar:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Verificar logs en la consola al ejecutar `npm start`

### Base de datos corrupta

Si la base de datos presenta problemas:

1. Cerrar la aplicación
2. Eliminar el archivo `pos.db` de la ubicación mencionada arriba
3. Reiniciar la aplicación (se creará una nueva base de datos limpia)

## 👥 Credenciales de Acceso

Por defecto, la aplicación acepta **cualquier usuario y contraseña** en el login (autenticación pendiente de implementar).

Para producción, se recomienda implementar autenticación real con:
- Hash de contraseñas (bcrypt)
- Tokens de sesión
- Validación en el backend

## 🚢 Distribución

### Crear instalador para Windows:

```bash
npm run make
```

El instalador se generará en `out/make/`.

### Empaquetar sin instalador:

```bash
npm run package
```

La aplicación empaquetada estará en `out/absolute-pos-app-win32-x64/`.

## 📝 Notas Importantes

1. **Primera ejecución**: La primera vez que se ejecuta `npm install` puede tardar más debido a la compilación de módulos nativos.

2. **Base de datos**: Se crea automáticamente en el primer inicio. No es necesario configurar nada.

3. **Desarrollo**: Los cambios en el código se reflejan automáticamente con Hot Reload (excepto el proceso principal de Electron).

4. **Migraciones**: Si actualizas el proyecto y ya tienes datos, revisa [MIGRATION.md](MIGRATION.md) para información sobre cambios en la base de datos.

5. **Producción**: Para producción, se recomienda:
   - Implementar autenticación real
   - Agregar respaldos automáticos de la base de datos
   - Implementar logging de errores
   - Configurar actualizaciones automáticas

## 🤝 Contribución

Si deseas contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 📧 Contacto

Eduardo Baas Kauil - eduardo.baas@emtech.digital

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub!

