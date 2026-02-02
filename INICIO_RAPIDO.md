# 🚀 INICIO RÁPIDO - MÓDULO DE RESGUARDO

## ⚡ 5 MINUTOS PARA EMPEZAR

### Paso 1: Inicia la App (2 min)

```bash
npm start
```

### Paso 2: Login como Admin (1 min)

- Usuario: **admin**
- Contraseña: [la que configuraste]

### Paso 3: Accede al Módulo (1 min)

- Sidebar → **Administración** → **Resguardo de Bienes**

### Paso 4: ¡Crea tu primer resguardo! (1 min)

---

## 📝 FORMULARIO BÁSICO (5 CAMPOS)

```
1. Folio:              RSG-2024-001
2. Fecha:              [Hoy automático]
3. Planta:             CEDES Central
4. Responsables:       [Tu nombre] / [Tu cargo]
5. Bienes:             [Agregar al menos 1]
```

Luego: **Registrar** → **Generar PDF** ✅

---

## 🎯 OBJETIVO EN 10 MINUTOS

| Paso      | Acción              | Tiempo     |
| --------- | ------------------- | ---------- |
| 1         | Abrir app           | 2 min      |
| 2         | Login               | 1 min      |
| 3         | Ir a Resguardo      | 1 min      |
| 4         | Llenar Folio        | 1 min      |
| 5         | Llenar Origen       | 2 min      |
| 6         | Llenar Responsables | 2 min      |
| 7         | Agregar Bien        | 2 min      |
| 8         | Registrar           | 1 min      |
| 9         | PDF                 | 1 min      |
| **TOTAL** |                     | **13 min** |

---

## 📚 MÁS INFORMACIÓN

| Necesito...           | Ver...                              | Tiempo |
| --------------------- | ----------------------------------- | ------ |
| Entender qué es       | RESUMEN_EJECUTIVO.md                | 5 min  |
| Probar el sistema     | GUIA_PRUEBAS_CUSTODY.md             | 30 min |
| Detalles técnicos     | IMPLEMENTACION_CUSTODY_MODULE.md    | 20 min |
| Validar todo          | CHECKLIST_FINAL.md                  | 10 min |
| Documentación técnica | src/modules/custody-entry/README.md | 15 min |

---

## ✅ VALIDACIÓN RÁPIDA

Después de 10 minutos, debería tener:

- [ ] Resguardo creado en BD
- [ ] PDF generado
- [ ] Mensaje de éxito
- [ ] Folio único

Si veo ❌ error → Ver **GUIA_PRUEBAS_CUSTODY.md**

---

## 🆘 PROBLEMA FRECUENTE

### "No veo el módulo en Sidebar"

```
Solución:
1. ¿Estoy logueado como ADMIN?
   → Si NO, cambia de usuario
   → Si SÍ, continúa...

2. ¿Está grupo "Administración" visible?
   → Haz clic en el grupo para expandir

3. ¿Aún no aparece?
   → Recarga página (F5) o reinicia app
```

---

## 🎓 PRÓXIMO PASO

Después de dominar lo básico:

- Lee **INDICE_DOCUMENTACION.md**
- Explora los 9 casos de prueba
- Entiende la arquitectura

---

## 📱 DESDE TU CELULAR

¿Quieres probar desde mobile?

- ✅ La app es responsive
- ✅ Funciona en tablets
- ✅ Pantalla ajustable

---

## 💡 TIPS PRO

1. **Folio**: Usa formato `RSG-AAAA-###` para validar
2. **Serial**: Opcional pero recomendado
3. **PDF**: Se genera después de guardar
4. **Errores**: Lee el mensaje en rojo arriba
5. **Estadísticas**: Mira el carrito en tiempo real

---

## 🔍 VERIFICACIÓN RÁPIDA

¿Todo funciona? ✅

```javascript
// En consola del navegador (F12)
console.log(window.custody); // Debe mostrar objeto con 6 métodos
console.log(window.reports.generateCustodyVoucher); // Debe existir
```

---

## 📞 AYUDA

| Problema           | Solución                      |
| ------------------ | ----------------------------- |
| "Folio duplicado"  | Usa otro folio (RSG-2024-002) |
| "Inv# duplicado"   | Cambiar número de inventario  |
| "PDF no se genera" | Guardar primero, luego PDF    |
| "Errores rojos"    | Completar campos requeridos   |

---

## ⏳ TIEMPO TOTAL APRENDIZAJE

- **Hoy**: 10 min (introducción)
- **Mañana**: 30 min (pruebas)
- **Esta semana**: 1 hora (entender todo)
- **Maestría**: 4 horas (conocer bien)

---

## 🎉 FELICIDADES

¡Ya estás usando el **Módulo de Resguardo**! 🚀

### Próximos módulos a descubrir:

- Visualización de resguardos
- Gestión de devoluciones
- Reportes consolidados

---

**Iniciado**: Ahora  
**Estado**: ✅ Listo para usar  
**Soporte**: Ver INDICE_DOCUMENTACION.md
