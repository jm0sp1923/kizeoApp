import axios from "axios";
import "dotenv/config";
import  getAccessToken  from "./getTokenSPO.js";
import verificarCarpeta from "./verificarIfCarpetExitsSPO.js";

const { SITE_ID, DRIVE_ID } = process.env;

// 🔹 Crear una carpeta en SharePoint si no existe
const crearCarpeta = async (parentPath, nombreCarpeta) => {
  try {
    const existe = await verificarCarpeta(parentPath, nombreCarpeta);
    if (existe) return;

    const accessToken = await getAccessToken();

    const body = {
      name: nombreCarpeta,
      folder: {},
      "@microsoft.graph.conflictBehavior": "rename",
    };

    let url = `https://graph.microsoft.com/v1.0/sites/${SITE_ID}/drives/${DRIVE_ID}/root:/${parentPath}:/children`;

    console.log(`📂 Creando carpeta en: ${url}`);

    await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`✅ Carpeta creada: ${parentPath}/${nombreCarpeta}`);
  } catch (error) {
    console.error(
      `❌ Error al crear la carpeta ${parentPath}/${nombreCarpeta}:`,
      error.response?.data || error.message
    );
  }
};

export default crearCarpeta;
