# 🏢 Sistema de Gestión de Bienes – Sede Valladolid

Sistema integral de **control patrimonial y resguardo de bienes** desarrollado con Electron, React y SQLite.

Aplicación de escritorio diseñada para gestionar el registro, resguardo, procesos internos y salidas oficiales de bienes institucionales.

---

## 📋 Características

* ✅ **Registro de Bienes**: Alta de bienes con número de inventario, serie, marca, modelo y condición
* ✅ **Gestión de Resguardo**: Asignación de bienes a áreas o departamentos
* ✅ **Control de Procesos**: Mantenimiento, reasignación, reporte de daño y baja
* ✅ **Control de Salidas**: Registro de salidas temporales o definitivas
* ✅ **Historial de Movimientos**: Trazabilidad completa de cada bien
* ✅ **Base de datos local**: SQLite embebida (sin servidor externo)
* ✅ **Interfaz moderna**: Diseño responsivo con Tailwind CSS
* ✅ **Desktop App**: Multiplataforma (Windows, macOS, Linux)

---

## 🚀 Instalación y Configuración

### Requisitos Previos

* **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
* **npm** v9 o superior
* **Git** (opcional)

---

### Pasos de Instalación

1. **Clonar el repositorio**:

```bash
git clone <url-del-repo>
cd gestion-bienes-valladolid
```

2. **Instalar dependencias**:

```bash
npm install
```

> ⚠️ El comando `npm install` automáticamente:
>
> * Instala todas las dependencias
> * Ejecuta `electron-rebuild` para compilar módulos nativos (`better-sqlite3`)
> * Puede tardar 2-3 minutos la primera vez

3. **Iniciar la aplicación**:

```bash
npm start
```

La base de datos se creará automáticamente en la primera ejecución.

---

## 📁 Ubicación de la Base de Datos

La base de datos SQLite se crea automáticamente en:

* **Windows**:
  `C:\Users\<usuario>\AppData\Roaming\gestion-bienes-valladolid\bienes.db`

* **macOS**:
  `~/Library/Application Support/gestion-bienes-valladolid/bienes.db`

* **Linux**:
  `~/.config/gestion-bienes-valladolid/bienes.db`

---

## 🛠️ Scripts Disponibles

```bash
# Iniciar en modo desarrollo
npm start

# Empaquetar la aplicación
npm run package

# Crear instaladores
npm run make

# Reconstruir módulos nativos
npx electron-rebuild
```

---

## 📦 Tecnologías Utilizadas

### Frontend

* **React 19**
* **React Router v7**
* **Tailwind CSS v3**

### Backend

* **Electron 39**
* **better-sqlite3**
* **Node.js**

### Build Tools

* **Webpack 5**
* **Babel**
* **Electron Forge**

---

## 🏗️ Estructura del Proyecto

```
gestion-bienes-valladolid/
├── src/
│   ├── components/            # Componentes compartidos
│   │   └── Layout.jsx
│   ├── modules/
│   │   ├── auth/              # Autenticación (pendiente mejora)
│   │   ├── bienes/            # Registro de bienes
│   │   ├── movimientos/       # Procesos y cambios de estado
│   │   ├── salidas/           # Control de salidas
│   │   └── recepcion/         # Registro de entrega y recepción
│   ├── main/
│   │   ├── db/
│   │   │   ├── connection.js
│   │   │   ├── migrations.js
│   │   │   └── tables.js
│   │   └── ipc/
│   │       ├── bienes.ipc.js
│   │       ├── movimientos.ipc.js
│   │       └── salidas.ipc.js
│   ├── app.jsx
│   ├── main.js
│   ├── preload.js
│   ├── renderer.js
│   └── index.css
├── webpack.*.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🔄 Flujo Operativo del Sistema

1. Registro del bien
2. Asignación de número de inventario
3. Resguardo por área o departamento
4. Movimiento interno (si aplica)
5. Registro de salida (temporal o definitiva)
6. Retorno o baja del sistema

Cada acción queda registrada en el historial del bien.

---

## 🔧 Solución de Problemas

### Error: "Cannot find module better-sqlite3"

```bash
npx electron-rebuild
```

Si persiste:

```bash
npm uninstall better-sqlite3
npm install better-sqlite3
npx electron-rebuild
```

---

### Base de datos corrupta

1. Cerrar la aplicación
2. Eliminar el archivo `bienes.db`
3. Reiniciar la aplicación

---

## 👥 Credenciales de Acceso

Actualmente la autenticación es básica (en desarrollo).

Para entorno productivo se recomienda:

* Implementar autenticación con bcrypt
* Control de roles:

  * Administrador
  * Almacén
  * Dirección
* Bitácora de auditoría

---

## 🚢 Distribución

### Crear instalador:

```bash
npm run make
```

Se generará en:

```
out/make/
```

---

## 📝 Notas Importantes

1. La base de datos es local y se crea automáticamente.
2. El sistema está adaptado desde una arquitectura POS hacia control patrimonial.
3. Ideal para uso interno en sedes institucionales.
4. Puede ampliarse para conexión en red o respaldo automático.

---

## 🎯 Objetivo del Proyecto

Desarrollar una solución local de control patrimonial que permita:

* Organización eficiente de bienes
* Trazabilidad completa
* Reducción de pérdidas
* Digitalización del resguardo
* Mejor control administrativo

---

## 📄 Licencia

Proyecto desarrollado con fines académicos y administrativos.

---

📧 Contacto

Wilbert Oliver Chan-l22070034@valladolid.tecnm.mx

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub.
