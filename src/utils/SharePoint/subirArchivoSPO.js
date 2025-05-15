import axios from "axios";
import  getAccessToken  from "../../config/tokenTenant.js";
import "dotenv/config";

const { SITE_ID, DRIVE_ID } = process.env;

// 🔹 Subir archivo a SharePoint
const subirArchivoGraphAPI = async (fileBuffer, fileName, ruta) => {
  try {
    const accessToken = await getAccessToken();
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${ruta}/${fileName}:/content`;

    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
    });

    console.log(`✅ Archivo subido con éxito en: ${ruta}/${fileName}`);
  } catch (error) {
    console.error(
      "❌ Error al subir el archivo:",
      error.response?.data || error.message
    );
  }
};

export default subirArchivoGraphAPI;