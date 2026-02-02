# 🎨 Mejoras al Diseño de Reportes PDF

## 📋 Resumen de Cambios

Se ha mejorado significativamente el formato de los reportes PDF para hacerlos más profesionales, atractivos y completos, utilizando toda la información de la empresa.

---

## ✨ Nuevas Características

### 1. **Encabezado Corporativo Profesional**

- 🎯 Fondo azul corporativo (RGB: 41, 128, 185)
- 📝 Nombre de la empresa en grande y destacado
- 📞 Información completa de contacto:
  - RFC
  - Teléfono
  - Email
  - Dirección física
- 🎨 Línea decorativa separadora

### 2. **Comprobante de Venta Individual (CUSTOM)**

#### Estructura Visual:

```
┌─────────────────────────────────────────┐
│   ENCABEZADO EMPRESA (Azul)             │
│   • Nombre, RFC, Tel, Email, Dirección  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   COMPROBANTE DE VENTA (Gris claro)     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Folio: #123      Fecha: 17/01/2026      │
│ Vendedor: Juan   Método: Efectivo       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   DETALLE DE PRODUCTOS (Azul oscuro)    │
├─────────────────────────────────────────┤
│ Producto | Cant. | P.Unit. | Subtotal   │
├─────────────────────────────────────────┤
│ Item 1   |  2    | $10.00  | $20.00    │
│ Item 2   |  1    | $15.00  | $15.00    │ (alternado)
└─────────────────────────────────────────┘

                    ┌──────────────┐
                    │ TOTAL: $35.00│ (Verde)
                    └──────────────┘

        ¡Gracias por su compra!
```

#### Características:

- ✅ Caja con borde redondeado para información de venta
- ✅ Tabla con encabezado de fondo oscuro
- ✅ Filas con colores alternados para mejor legibilidad
- ✅ Total destacado en caja verde
- ✅ Mensaje de agradecimiento
- ✅ Pie de página con website y fecha de generación

### 3. **Reportes de Período (Diario/Semanal/Mensual/Anual)**

#### Estructura Visual:

```
┌─────────────────────────────────────────┐
│   ENCABEZADO EMPRESA (Azul)             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     REPORTE DE VENTAS (Gris claro)      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Tipo: Semanal                           │
│ Período: 01/01/2026 - 07/01/2026        │
│ Generado: 17/01/2026 10:30              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│      RESUMEN GENERAL (Azul oscuro)      │
└─────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┐
│Total Vendido│Transacciones│Ticket Prom. │
│  (Verde)    │   (Azul)    │  (Morado)   │
│  $1,250.00  │     45      │   $27.78    │
└─────────────┴─────────────┴─────────────┘

┌─────────────────────────────────────────┐
│  DETALLE DE TRANSACCIONES (Azul oscuro) │
├─────────────────────────────────────────┤
│Folio│Fecha│Vendedor│Método│Total         │
├─────────────────────────────────────────┤
│ #1  │...  │...     │...   │$25.00       │
│ #2  │...  │...     │...   │$30.00       │ (alternado)
└─────────────────────────────────────────┘
```

#### Características:

- ✅ **3 Tarjetas de Estadísticas** con colores distintivos:
  - 🟢 Verde: Total Vendido
  - 🔵 Azul: Número de Transacciones
  - 🟣 Morado: Ticket Promedio
- ✅ Tabla detallada con columnas organizadas
- ✅ Filas alternadas para mejor lectura
- ✅ Manejo automático de paginación
- ✅ Re-impresión de encabezados en páginas nuevas

---

## 🎨 Paleta de Colores

| Color            | RGB           | Uso                          |
| ---------------- | ------------- | ---------------------------- |
| Azul Corporativo | 41, 128, 185  | Encabezado principal         |
| Azul Oscuro      | 52, 73, 94    | Títulos de sección           |
| Gris Claro       | 236, 240, 241 | Fondos de títulos            |
| Gris Medio       | 149, 165, 166 | Encabezados de tabla         |
| Verde            | 46, 204, 113  | Total/Estadística positiva   |
| Azul             | 52, 152, 219  | Estadística de transacciones |
| Morado           | 155, 89, 182  | Estadística de promedio      |
| Gris Texto       | 127, 140, 141 | Textos secundarios           |

---

## 📊 Información de la Empresa Incluida

El PDF ahora utiliza automáticamente toda la información configurada en el sistema:

- ✅ **Nombre de la Empresa** (company_name)
- ✅ **RFC** (company_rfc)
- ✅ **Teléfono** (company_phone)
- ✅ **Email** (company_email)
- ✅ **Dirección** (company_address)
- ✅ **Sitio Web** (company_website)

> **Nota**: Si algún campo no está configurado, simplemente no se muestra en el PDF.

---

## 🔧 Configuración

Para que el PDF muestre la información completa de tu empresa, asegúrate de configurar todos los datos en:

**Menú → Configuración → Información de la Empresa**

Los campos disponibles son:

- Nombre de la Empresa
- RFC
- Teléfono
- Dirección
- Email
- Sitio Web

---

## 🚀 Mejoras Técnicas

### Antes:

- Diseño simple en blanco y negro
- Solo texto básico
- Sin información de empresa
- Tablas sin formato
- Difícil de leer

### Ahora:

- ✅ Diseño profesional con colores
- ✅ Tipografía variada (bold, italic, tamaños)
- ✅ Información completa de la empresa
- ✅ Tablas con encabezados destacados
- ✅ Filas alternadas para mejor lectura
- ✅ Cajas con bordes redondeados
- ✅ Tarjetas visuales para estadísticas
- ✅ Mejor uso del espacio
- ✅ Paginación inteligente
- ✅ Pie de página informativo

---

## 📸 Comparación Visual

### Comprobante de Venta

**Antes**: Texto plano en blanco y negro
**Ahora**: Encabezado azul, cajas organizadas, tabla con colores, total destacado en verde

### Reportes de Período

**Antes**: Lista simple de ventas
**Ahora**: Tarjetas de estadísticas coloridas, tabla organizada, diseño profesional

---

## 🎯 Próximos Pasos (Opcionales)

Mejoras futuras que se podrían implementar:

1. **Agregar Logo de la Empresa**
   - Permitir subir una imagen
   - Mostrarla en el encabezado

2. **Gráficos Visuales**
   - Gráfico de barras de ventas por día
   - Gráfico de pie para métodos de pago

3. **Personalización de Colores**
   - Permitir al usuario elegir colores corporativos

4. **Códigos QR**
   - QR con enlace a verificación online
   - QR con datos de la venta

5. **Productos Más Vendidos**
   - Sección adicional en reportes de período

---

## 📝 Notas Técnicas

- El código mantiene compatibilidad con versiones anteriores
- Los PDFs se generan con jsPDF 2.5.2
- Soporte automático para paginación en reportes largos
- Los encabezados se re-imprimen en cada página nueva
- Manejo de casos donde no hay datos (mensajes informativos)

---

**Fecha de implementación**: 17 de enero de 2026
**Archivo modificado**: `src/main/ipc/reports.ipc.js`
