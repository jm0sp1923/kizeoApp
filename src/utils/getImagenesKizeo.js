import axios from "axios";
import "dotenv/config";

const getImagen = async (formId, dataId, nameMedia) => {
  try {
    const apiKey = process.env.KIZEO_API_KEY;
    const url = `https://forms.kizeo.com/rest/v3/forms/${formId}/data/${dataId}/medias/${nameMedia}`;

    const response = await axios.get(url, {
      headers: { Authorization: apiKey },
      responseType: 'arraybuffer', // ✅ Para obtener buffer
    });

    return {
      response: response.data, // ✅ El buffer de la imagen
    };

  } catch (error) {
    console.error("❌ Error al obtener la imagen:", error.message);
    throw new Error(`Error al obtener la imagen: ${error.message}`);
  }
};

export { getImagen };
