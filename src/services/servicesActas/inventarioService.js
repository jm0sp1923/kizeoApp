import { obtenExportId } from "../../utils/getExportId.js";
import getActaPdf from "../../utils/getActaPdf.js";
import crearCarpeta from "../../utils/SharePoint/crearCarpetaSPO.js";
import { sacarMes } from "../../utils/sacarMes.js";
import { getImagen } from "../../utils/getImagenesKizeo.js";
import subirArchivoGraphAPI from "../../utils/SharePoint/subirArchivoSPO.js";
import "dotenv/config";

async function subirActaInventarioService(data_id, form_id, data) {
  try {
    // 📌 Extraer datos del formulario
    let arrendador =
      data.fields?.nombre_del_arrendador?.result?.value?.code.trim() ||
      "Arrendador Desconocido";
      console.log("Arrendador", arrendador);    
    let fechaEntrega =
      data.fields.fecha_de_entrega?.result?.value?.date || "0000-00-00";
    let referencia_inmueble =
      data.fields?.referencia_inmueble?.result?.value.trim() ||
      "Referencia Desconocida";
    let imagenes = data.media || [];
    let [year, month] = fechaEntrega.split("-");

    const mes = await sacarMes(parseInt(month));

    const exportId = await obtenExportId(form_id);

    const { buffer, fileName } = await getActaPdf(
      form_id,
      data_id,
      exportId[0].id
    );

    let buffer_imgagenes = [];

    for (let i = 0; i < imagenes.length; i++) {
      const { response } = await getImagen(form_id, data_id, imagenes[i]);
      buffer_imgagenes.push(response);
    }


    let rutaBase = "Inventarios Inmuebles";
    let rutaActual = rutaBase;

    let carpetas = [arrendador, year, mes, referencia_inmueble];

    for (let carpeta of carpetas) {
      await crearCarpeta(rutaActual, carpeta);
      rutaActual += `/${carpeta}`;
    }

    let rutaImagenes = `${rutaActual}/Imagenes`;

    await subirArchivoGraphAPI(buffer, fileName, rutaActual);

    for(let i = 0; i < buffer_imgagenes.length; i++) {
        const bufferImagen = buffer_imgagenes[i];
        const nombreImagen = imagenes[i];
        await subirArchivoGraphAPI(bufferImagen, nombreImagen, rutaImagenes);
    }

 
  } catch (error) {
    console.error("❌ Error en el servicio:", error.message);
    throw new Error(error.message);
  }
}

export { subirActaInventarioService };
