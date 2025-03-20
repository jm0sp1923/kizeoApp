import { obtenExportId } from "../utils/getExportId.js";
import getActaPdf from "../utils/getActaPdf.js";
import  crearCarpeta  from "../utils/crearCarpetaSPO.js";
import subirArchivoGraphAPI from "../utils/subirArchivoSPO.js";
import "dotenv/config";

async function entregaConPrevisitaService(data_id, form_id, data) {
  try {
    // 📌 Extraer datos del formulario
    let zona = data.fields?.zonas?.result?.value?.code.trim() || "Zona Desconocida";
    let tipoDiligencia = data.fields.acta_de_diligencia?.result?.value?.trim() ||"Diligencia Desconocida";
    let fechaDiligencia = data.fields.fecha_de_diligencia?.result?.value?.date || "0000-00-00";
    let [year, month] = fechaDiligencia.split("-");
    let exportId = await obtenExportId(form_id);

    console.log("📌 Datos del formulario:");
    console.log("data_id:", data_id);
    console.log("exportId:", exportId);
    console.log("form_id:", form_id);
    console.log("zona:", zona);
    console.log("tipoDiligencia:", tipoDiligencia);
    console.log("fechaDiligencia:", fechaDiligencia);

    
    const { buffer, fileName }= await getActaPdf(form_id, data_id, exportId);
    
    let rutaBase = "Actas Kizeo";
    let rutaActual = rutaBase;

    let carpetas = [zona, tipoDiligencia, year, month];

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

export { entregaConPrevisitaService };
