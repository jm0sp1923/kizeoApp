
# 📨 Automatización de Envío Diario de Reportes de Direcciones

## 📌 Descripción General
Este script automatiza el envío diario de reportes de cambios de dirección obtenidos desde **Kizeo**. Cada día (excepto domingos), el sistema:

1. Consulta los reportes creados el día anterior.
2. Genera un archivo Excel con los reportes encontrados.
3. Envía un correo a Operaciones:
   - ✅ Con el Excel adjunto, si hay reportes.
   - 📨 Solo con un mensaje, si no hay reportes.

---

## 🛠️ Archivos involucrados

### 1. `generarReporte.js`
Contiene la lógica principal del proceso:

- Calcula la fecha del día anterior (excluye domingos).
- Consulta los reportes de la base de datos (`reportes.js`).
- Genera el Excel usando `generarExcelReportes`.
- Llama a `enviarCorreo()` con el contenido correspondiente.

### 2. `emailReportesTemplate.js`
Plantilla HTML del correo enviado cuando **sí hay reportes**. Contiene el logo y un texto indicando que el archivo está adjunto.

### 3. `emailSinReportesTemplate.js`
Plantilla HTML para el correo enviado cuando **no hay reportes**. Informa que no se encontraron registros ese día.

### 4. `remitentes.js`
Modelo de MongoDB que guarda la configuración del destinatario del correo (`email`).

---

## 🔄 Flujo del Proceso

1. Inicia script
2. Calcula el día anterior (salta domingos)
3. Consulta los reportes en MongoDB
4. Si hay reportes:
   - Genera archivo Excel
   - Renderiza plantilla con Excel
   - Envía correo con Excel adjunto
5. Si NO hay reportes:
   - Renderiza plantilla sin Excel
   - Envía correo sin adjunto

---

## 📅 Criterios de Fecha

- Se retrocede un día desde hoy.
- Si ese día es **domingo** (`getDay() === 0`), se sigue retrocediendo hasta encontrar el día hábil más reciente.

---

## 🧪 Ejemplo de respuesta esperada

### ✅ Si hay reportes:
- Asunto: *Resumen de Cambios de Dirección*
- Contenido: Mensaje con la fecha + archivo Excel adjunto

### ❌ Si no hay reportes:
- Asunto: *Resumen de Cambios de Dirección*
- Contenido: Mensaje informando que no hay reportes

---

## 📤 Envío de correo

Se utiliza la API de **Microsoft Graph** con `axios`, autenticado mediante un token de acceso (`getAccessToken()`), y el correo se envía desde:

```
const sender = "comercial@affi.net";
```

---

## 📁 Ejemplo de documento Excel generado

- Columnas: depende del diseño de `crearExcelReportes.js`
- Formato: `.xlsx`
- Nombre: `reporte_direcciones.xlsx`

---

## ✅ Requisitos para que funcione

- Base de datos MongoDB conectada y con la colección `reportes` y `remitentes`.
- Un registro válido en `remitentes` con un campo `email`.
- Acceso válido a Microsoft Graph para enviar correos.
- Permisos de lectura/escritura de archivos (`fs`).
