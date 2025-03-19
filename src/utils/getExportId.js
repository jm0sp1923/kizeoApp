import axios from "axios";
import "dotenv/config";

const obtenExportId = async (formId) => {
  try {
    let apiKey = process.env.KIZEO_API_KEY;
    const response = await axios.get(
      `https://www.kizeoforms.com/rest/v3/forms/${formId}/exports`,
      {
        headers: { Authorization: apiKey },
      }
    );

    const data = await response.data;
    if (data.status === "ok" && data.exports.length > 0) {
      let exportId = data.exports[0].id;
      console.log("Export ID:", exportId);
      return exportId; 
    } else {
      throw new Error(
        'No se encontraron exportaciones o el estado no es "ok".'
      );
    }
  } catch (error) {
    console.error("Error al obtener el exportId:", error.message);
    throw new Error(`Error al obtener el exportId: ${error.message}`);
  }
};

export { obtenExportId };
