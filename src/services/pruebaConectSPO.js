import { sp } from "@pnp/sp-commonjs";
import spAuth from "node-sp-auth";
const AuthFetchClient = spAuth.AuthFetchClient;
import getActaPdf from "../utils/getActaPdf.js";
import "dotenv/config";

// 🔹 Cargar credenciales desde .env
const { USER_NAME, PASSWORD, SITE_URL } = process.env;

const authClient = new AuthFetchClient(SITE_URL, { username: USER_NAME, password: PASSWORD });

sp.setup({
    sp: {
        fetchClientFactory: () => authClient,
    },
});

// 🔹 Función para subir un archivo PDF a SharePoint
const subirArchivoSharePoint = async (buffer, fileName) => {
    try {
        const fileBuffer = buffer;

        const folderRelativeUrl = "Shared Documents"; // Ruta de la carpeta en SharePoint

        const file = await sp.web.getFolderByServerRelativePath(folderRelativeUrl)
            .files.add(fileName, fileBuffer, true);

        console.log("✅ Archivo subido con éxito:", file.data);
        return file.data;
    } catch (error) {
        console.error("❌ Error al subir el archivo:", error.message);
        throw new Error("No se pudo subir el archivo.");
    }
};

const procesarYSubirActa = async (formId, dataId, exportId) => {
    try {
        const { buffer, filename } = await getActaPdf(1022053, 219688903, 1540559); // Obtener PDF en buffer

        if (buffer) {
            await subirArchivoSharePoint(buffer, filename); // 🔹 Subir el buffer a SharePoint
            console.log(`✅ Acta subida: ${filename}`);
        } else {
            throw new Error("El archivo PDF no se generó correctamente.");
        }
    } catch (error) {
        console.error("❌ Error en el proceso:", error.message);
    }
};


export { procesarYSubirActa };
