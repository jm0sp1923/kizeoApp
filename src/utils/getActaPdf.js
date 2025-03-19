import axios from "axios";
import "dotenv/config" 



const getActaPdf = async (formId, dataId, exportId) => {
  try {
    const apiKey = process.env.KIZEO_API_KEY;
    let url = `https://forms.kizeo.com/rest/v3/forms/${formId}/data/${dataId}/exports/${exportId}/pdf`;

    const response = await axios.get(url, {
      headers: { Authorization: apiKey },
      responseType: 'arraybuffer', 
    });

    return {
      buffer: response.data, 
      fileName: response.headers.get('x-filename-custom').replace(/[^a-zA-Z0-9._-]/g, '')
    };

  } catch (error) {
    console.error("❌ Error al obtener el acta:", error.message);
    throw new Error(`Error al obtener el acta: ${error.message}`);
  }
};


export default getActaPdf;
