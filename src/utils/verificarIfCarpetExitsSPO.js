import axios from "axios";
import "dotenv/config";
import  getAccessToken  from "./getTokenSPO.js";
const { SITE_ID, DRIVE_ID } = process.env;

// 🔹 Verificar si una carpeta ya existe en SharePoint

const verificarCarpeta = async (parentPath, nombreCarpeta) => {
  try {
    const accessToken = await getAccessToken();
    let url = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${parentPath}/${nombreCarpeta}`;

    await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`✅ Carpeta ya existe: ${parentPath}/${nombreCarpeta}`);
    return true; // La carpeta ya existe
  } catch (error) {
    if (error.response?.status === 404) {
      return false; // La carpeta no existe
    }
    console.error(
      `❌ Error al verificar la carpeta ${parentPath}/${nombreCarpeta}:`,
      error.response?.data || error.message
    );
    return false;
  }
};

export default verificarCarpeta;