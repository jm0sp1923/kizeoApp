import { obtenExportId } from "../../utils/getExportId.js";
import getActaPdf from "../../utils/getActaPdf.js";
import  crearCarpeta  from "../../utils/crearCarpetaSPO.js";
import subirArchivoGraphAPI from "../../utils/subirArchivoSPO.js";
import { sacarMes } from "../../utils/sacarMes.js";
import "dotenv/config";

async function entregaSinPrevisitaService(data_id, form_id, data) {
  try {
    let zona = data.fields?.zonas?.result?.trim() || "Zona Desconocida";
    let tipoDiligencia = data.fields.acta_de_diligencia?.result?.value?.trim() ||"Diligencia Desconocida";
    let fechaDiligencia = data.fields.fecha_y_hora_diligencia?.result?.value?.date || "0000-00-00";
    let [year, month] = fechaDiligencia.split("-");

    const mes = await sacarMes(parseInt(month));
    const exportId = await obtenExportId(form_id);
    const { buffer, fileName }= await getActaPdf(form_id, data_id, exportId[0].id);
    
    let rutaBase = "Previsitas - Entregas";
    let rutaActual = rutaBase;
    
    let carpetas = [zona, tipoDiligencia, year, mes];

    for (let carpeta of carpetas) {
      await crearCarpeta(rutaActual, carpeta);
      rutaActual += `/${carpeta}`;
    }
    
    await subirArchivoGraphAPI(buffer, fileName, rutaActual);

    
  } catch (error) {
    console.error("❌ Error en el servicio:", error.message);
    throw new Error(error.message);
  }
}

export { entregaSinPrevisitaService };
