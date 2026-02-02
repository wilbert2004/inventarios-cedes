# Documentación - Absolute POS

Bienvenido a la documentación del sistema Absolute POS. Esta carpeta contiene toda la documentación técnica y de usuario del proyecto.

## 📚 Documentos Disponibles

### Guías de Inicio

- **[Inicio Rápido](./QUICK_START.md)** - Checklist para poner en marcha el proyecto en una nueva computadora

### Sistema de Licencias

- **[Sistema de Licencias](./LICENSING.md)** - Guía completa para generar y gestionar licencias del sistema
  - Cómo obtener Hardware IDs
  - Proceso de generación de licencias
  - Solución de problemas
  - Preguntas frecuentes

### Base de Datos

- **[Migraciones de Base de Datos](./DATABASE_MIGRATIONS.md)** - Sistema de versionado y migraciones
- **[Guía de Migración](./MIGRATION_GUIDE.md)** - Cómo migrar datos entre versiones
- **[Migración](./MIGRATION.md)** - Información sobre cambios en la base de datos

### Autenticación

- **[Autenticación](./AUTHENTICATION.md)** - Sistema de autenticación y gestión de usuarios

### Funcionalidades

- **[Impresión](./PRINTING.md)** - Configuración y uso del sistema de impresión

### Análisis y Planificación

- **[Análisis Multi-Cajero](./MULTICASHIER_ANALYSIS.md)** - Análisis de funcionalidad multi-cajero
- **[Análisis de Preparación MVP](./MVP_READINESS_ANALYSIS.md)** - Estado de preparación del MVP

## 🚀 Inicio Rápido

### Para Desarrolladores

#### Generar una Licencia

Si necesitas generar una licencia rápidamente:

1. Obtén el Hardware ID del cliente
2. Ejecuta: `node scripts/generate-license.js <hardware-id>`
3. Entrega la licencia generada al cliente

Para más detalles, consulta [LICENSING.md](./LICENSING.md).

#### Configurar el Proyecto

1. Clona el repositorio
2. Ejecuta `npm install`
3. Inicia con `npm start`

Para más detalles, consulta [QUICK_START.md](./QUICK_START.md).

## 📖 Estructura de Documentación

```
documentation/
├── README.md                    # Este archivo
├── LICENSING.md                # Sistema de licencias
├── QUICK_START.md              # Guía de inicio rápido
├── DATABASE_MIGRATIONS.md      # Migraciones de BD
├── MIGRATION_GUIDE.md          # Guía de migración
├── MIGRATION.md                # Información de migración
├── AUTHENTICATION.md           # Autenticación
├── PRINTING.md                 # Sistema de impresión
├── MULTICASHIER_ANALYSIS.md    # Análisis multi-cajero
└── MVP_READINESS_ANALYSIS.md   # Análisis MVP
```

## 🔄 Actualizaciones

Esta documentación se actualiza junto con el sistema. Si encuentras información desactualizada o tienes sugerencias, por favor notifica al equipo de desarrollo.

## 📧 Contacto

Para preguntas o soporte sobre la documentación:
- Revisa primero la documentación relevante
- Consulta los logs del sistema
- Contacta al equipo de desarrollo si el problema persiste

---

**Absolute POS** - Sistema de Punto de Venta

**Última actualización:** 2024
