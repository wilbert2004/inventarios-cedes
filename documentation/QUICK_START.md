# 🚀 Guía de Inicio Rápido

Checklist para poner en marcha el proyecto en una nueva computadora.

## ✅ Checklist de Instalación

### 1. Verificar Requisitos
```bash
# Verificar Node.js (debe ser v18+)
node --version

# Verificar npm (debe ser v9+)
npm --version
```

Si no tienes Node.js instalado, descárgalo desde [nodejs.org](https://nodejs.org/)

### 2. Clonar e Instalar
```bash
# Clonar el repositorio
git clone <url-del-repo>
cd absolute-pos-app

# Instalar dependencias (incluye electron-rebuild automático)
npm install
```

⏱️ **Tiempo estimado**: 2-3 minutos

### 3. Iniciar la Aplicación
```bash
npm start
```

✨ **¡Listo!** La aplicación se abrirá automáticamente.

## 🎯 Primera Ejecución

### Login
- **Usuario**: cualquier texto
- **Contraseña**: cualquier texto
- *(La autenticación real está pendiente de implementar)*

### Base de Datos
La base de datos SQLite se crea automáticamente en:
- Windows: `%APPDATA%\absolute-pos-app\pos.db`
- macOS: `~/Library/Application Support/absolute-pos-app/pos.db`
- Linux: `~/.config/absolute-pos-app/pos.db`

## 🧪 Verificación de Funcionalidades

### Productos
1. Navega a "Productos" en el sidebar
2. Haz clic en "Nuevo Producto"
3. Completa el formulario y guarda
4. Verifica que aparezca en la tabla

### Punto de Venta
1. Navega a "Punto de Venta" en el sidebar
2. Usa el campo de búsqueda para agregar productos
3. Ajusta cantidades con los botones +/-
4. Ingresa un monto de pago y cobra

## 🔍 Verificación de Instalación

Si algo no funciona, ejecuta estos comandos:

```bash
# 1. Verificar que los módulos nativos se compilaron
npx electron-rebuild

# 2. Verificar que no hay errores
npm start
```

### Posibles Problemas

#### Error: "Cannot find module 'better-sqlite3'"
```bash
npm uninstall better-sqlite3
npm install better-sqlite3
npx electron-rebuild
```

#### Error: "EPERM: operation not permitted" (Windows)
- Ejecuta la terminal como **Administrador**
- O agrega la carpeta a las exclusiones del antivirus

#### La aplicación no inicia
```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Estado de Funcionalidades

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| 🔐 Login | ✅ Completo | Interfaz lista (auth pendiente) |
| 🛒 Ventas | ✅ Completo | Punto de venta funcional |
| 📦 Productos | ✅ Completo | CRUD completo con búsqueda |
| 📋 Inventario | 🚧 Pendiente | Próximamente |
| 📊 Reportes | 🚧 Pendiente | Próximamente |
| ⚙️ Configuración | 🚧 Pendiente | Próximamente |

## 🎨 Capturas de Pantalla

### Login
![Login](docs/screenshots/login.png)

### Punto de Venta
![POS](docs/screenshots/pos.png)

### Gestión de Productos
![Products](docs/screenshots/products.png)

## 💡 Consejos

1. **DevTools**: La aplicación abre DevTools automáticamente en desarrollo
2. **Hot Reload**: Los cambios en React se reflejan automáticamente
3. **Base de datos**: Se crea automáticamente, no requiere configuración
4. **Desarrollo**: Usa `rs` en la terminal para reiniciar el proceso principal

## 📚 Recursos Adicionales

- [Documentación completa](README.md)
- [Estructura del proyecto](README.md#estructura-del-proyecto)
- [Solución de problemas](README.md#solución-de-problemas)
- [Scripts disponibles](README.md#scripts-disponibles)

## 🤝 ¿Necesitas Ayuda?

Si encuentras algún problema:

1. Revisa la sección de [Solución de Problemas](README.md#solución-de-problemas)
2. Verifica que cumples con los requisitos previos
3. Intenta limpiar e reinstalar dependencias
4. Contacta al equipo de desarrollo

---

**¡Feliz desarrollo! 🚀**

