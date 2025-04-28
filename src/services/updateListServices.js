
import changeExcelToJson from "../utils/changeExcelToJson.js";
import axios from "axios";
import "dotenv/config";
import path from "path";
import fs from "fs";
const api_key = process.env.KIZEO_API_KEY;

async function updateListServices(listType, file) {
  try {
    if (!file.mimetype.includes("excel") && !file.mimetype.includes("spreadsheetml")) {
      throw new Error("El archivo debe ser un archivo Excel válido");
    }

    const jsonBody = await changeExcelToJson(file);
    if (!jsonBody) {
      throw new Error("Error al procesar el archivo Excel");
    }

    const kizeoUrl = `https://www.kizeoforms.com/rest/v3/lists/${listType}`;
    console.log("Iniciando petición a Kizeo: ", kizeoUrl);

    await axios.put(kizeoUrl, jsonBody, {
      headers: {
        Authorization: api_key,
      },
    });

    const filePath = path.resolve(file.path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Archivo eliminado correctamente");
    } else {
      console.error("Archivo no encontrado para eliminar");
    }

    return { success: true, message: "Lista actualizada correctamente desde Excel" };
  } catch (error) {
    console.error("Error al actualizar la lista:", error);
    throw error; // <--- Para que el controller maneje el error
  }
}


  export default updateListServices;