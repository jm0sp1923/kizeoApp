
# 📄 Webhook Kizeo + SharePoint

Este proyecto funciona como un **webhook para Kizeo** encargado de **subir automáticamente las actas a SharePoint**, donde estarán disponibles para el área de **RCI**. Además, ofrece una **interfaz amigable** para la **actualización de listas** dentro de Kizeo.

## 🎯 Funcionalidades

* **Subida automática de actas generadas desde Kizeo a SharePoint.**
* **Interfaz web para actualizar listas de:**
  * **Inmuebles para entregas**
  * **Previsitas**
* **Fusión de:**
  * **Base de cartera general**
  * **Base de afianzados**
* **(Próxima integración): Visitas oculares y visitas a inmuebles habitados.**

---

## 🚀 Ejecución Local

1. **Copia el archivo **`.env.example` y crea un nuevo archivo `.env`.
2. **Configura todas las variables de entorno necesarias (explicadas abajo).**
3. **Asegúrate de tener ****MongoDB** instalado localmente (o utilizar una instancia en la nube).
4. **Ejecuta la aplicación con el gestor de procesos que uses (ej. **`npm start`, `yarn dev`, etc.).

---

## 🔐 Variables de Entorno

### 🔸 API Key de Kizeo

```
KIZEO_API_KEY=appi_kizeo_123456789abcdef123456789abcdef12345678#
```

#### Obtención de la clave

1. **Debes tener un usuario administrador en la cuenta de Kizeo.**
2. **Escribe a **`support@kizeo.com` con el siguiente mensaje:

```
Estimado equipo de soporte,

Espero que se encuentren bien. Me comunico en calidad de administrador para solicitar un token de acceso para el uso de su API con nuestra cuenta en Kizeo Forms.

Sociedad: AFFI  
User ID: APPI_KIZEO

Agradezco su apoyo y quedo atento a cualquier información adicional.
```

---

### 🔸 MongoDB

```
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB_NAME=logsApp
MONGODB_COLLECTION_NAME=logs
```

* **Usa MongoDB local o en la nube.**
* **La configuración de producción está incluida en un archivo adjunto en la documentación.**

---

### 🔸 Azure Active Directory

```
CLIENT_SECRET=abcd1234~Xyz9876_example_secret_key
CLIENT_ID=12345678-90ab-cdef-1234-567890abcdef
TENANT_ID=abcdef12-3456-7890-abcd-ef1234567890
```

#### Requisitos:

1. **Crear una aplicación en ****Azure Active Directory**.
2. **Conceder los siguientes ****permisos API**:
   * `Files.ReadWrite.All`
   * `Sites.ReadWrite.All`

**Estos permisos permiten la modificación y carga de archivos en SharePoint.**

---

### 🔸 SharePoint

```
SITE_ID=example.sharepoint.com,abcd1234-5678-90ab-cdef-1234567890ab,9876abcd-5432-10fe-dcba-abcdef654321
DRIVE_ID=b!exampleDriveId1234567890abcdefgHIJKLmnopqrstUVWX
SITE_URL=https://example.sharepoint.com/sites/NombreDelSitio
```

* **Estas credenciales se obtienen mediante ****Microsoft Graph API**.
* **Permiten cargar archivos al sitio y carpeta correspondiente en SharePoint.**

---

## 📦 Producción

* **Consulta el archivo adjunto a la documentación para obtener las credenciales de producción.**
* **Verifica que la aplicación tenga permisos válidos en Azure y Kizeo.**

---

## ✅ Requisitos Previos

* **Node.js (o el entorno correspondiente si es otra tecnología)**
* **MongoDB**
* **Cuenta en Azure AD con permisos de administrador**
* **Cuenta en Kizeo con acceso a formularios y API**

---

**¿Dudas o problemas? No dudes en contactar al equipo de desarrollo o revisar los archivos adjuntos a esta documentación.**
