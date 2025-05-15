# 📄 Webhook Kizeo + SharePoint

**Este proyecto funciona como un** **webhook para Kizeo** encargado de **subir automáticamente las actas a SharePoint**, donde estarán disponibles para el área de **RCI**. Además, ofrece una **interfaz amigable** para la **actualización de listas** dentro de Kizeo.

---

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

1. **Copia el archivo** `.env.example` y crea un nuevo archivo `.env`.
2. **Configura todas las variables de entorno necesarias (explicadas abajo).**
3. **Asegúrate de tener** **MongoDB** instalado localmente (o utilizar una instancia en la nube).

---

## 🔐 Variables de Entorno

### 🔸 API Key de Kizeo

```
KIZEO_API_KEY=appi_kizeo_123456789abcdef123456789abcdef12345678#
```

#### Obtención de la clave

1. **Debes tener un usuario administrador en la cuenta de Kizeo.**
2. **Escribe a** [support@kizeo.com](mailto:support@kizeo.com) **con el siguiente mensaje:**

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
CLIENT_SECRET_AD=abcd1234~Xyz9876_example_secret_key
CLIENT_ID_AD=12345678-90ab-cdef-1234-567890abcdef
TENANT_ID_AD=abcdef12-3456-7890-abcd-ef1234567890
```

#### Requisitos:

1. **Crear una aplicación en** **Azure Active Directory**.
2. **Conceder los siguientes** **permisos API**:
   * `Files.ReadWrite.All`
   * `Sites.ReadWrite.All`

---

### 🔸 SharePoint

```
SITE_ID=example.sharepoint.com,abcd1234-5678-90ab-cdef-1234567890ab,9876abcd-5432-10fe-dcba-abcdef654321
DRIVE_ID=b!exampleDriveId1234567890abcdefgHIJKLmnopqrstUVWX
SITE_URL=https://example.sharepoint.com/sites/NombreDelSitio
```

**Estas credenciales se obtienen mediante** **Microsoft Graph API**.

**A continuación la explicación de como obtenerlas:**

---

## 1. Obtención del token de acceso

**POST**

```
https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token
```

**Reemplaza** `{TENANT_ID}` por el valor correspondiente.

### Body (x-www-form-urlencoded):

| **Key**     | **Value**                              |
| ----------------- | -------------------------------------------- |
| `client_id`     | `7747f7f3-7c59-462b-862c-29234b74209d`     |
| `scope`         | `https://graph.microsoft.com/.default`     |
| `client_secret` | `tih8Q~X6rgw3ecbtGPwmORoeFKh_FcXjB51ubaID` |
| `grant_type`    | `client_credentials`                       |

### Respuesta esperada:

```
{
  "token_type": "Bearer",
  "expires_in": 3599,
  "access_token": "eyJ0eXAiOiJKV1QiLCJub25jZSI6Ikp..."
}
```

---

## 2. Obtener el `SITE_ID`

**GET**

```
https://graph.microsoft.com/v1.0/sites/{dominio}.sharepoint.com:/sites/{nombre_del_sitio}
```

**Headers**:

```
Authorization: Bearer {access_token}
```

**Ejemplo de respuesta:**

```
{
  "id": "affisas.sharepoint.com,0be6009e-7e66-4680-a800-1b03d53f5c46,b6bc4b00-2504-42ee-8a27-cdc798a9d121",
  "name": "SEGUIMIENTOCARGUECONTRATOS",
  "webUrl": "https://affisas.sharepoint.com/sites/SEGUIMIENTOCARGUECONTRATOS"
}
```

---

## 3. Obtener el `DRIVE_ID`

**GET** a:

```
https://graph.microsoft.com/v1.0/sites/{site-id}/drive
```

**Headers**:

```
Authorization: Bearer {access_token}
```

**Ejemplo de respuesta:**

```
{
  "id": "b!ngDmC2Z-gEaoABsD1T9cRgBLvLYEJe5CiifNx5ip0SHxm4R_W62BRJ30XUdJaG5C",
  "name": "Documentos"
}
```

---

## 📦 Configuración entorno local

### ✅ Requisitos Previos

* **Node.js**
* **MongoDB**
* **Cuenta en Azure AD**
* **Cuenta en Kizeo**
* **Docker**

---

### 🔧 1. Ejecutar un `Dockerfile`

#### Pasos:

1. **Ve al directorio donde está  el Dockerfile:**

```
cd ruta/del/proyecto
```

2. **Construye la imagen:**

```
docker build -t kizeo-app .
```

3. **Ejecuta el contenedor:**

```
docker run -p 3000:3000 kizeo-app
```

**Esto expondrá tu aplicación en** `localhost:3000`.

---

## 👤 Autor

**Juan Sebastián Muñoz**
**Responsable de documentación y mantenimiento de formularios Kizeo**
[juan.munoz@affi.net](mailto:juan.munoz@affi.net)
