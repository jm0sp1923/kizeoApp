import { obtenExportId } from "../../utils/getExportId.js";
import getActaPdf from "../../utils/getActaPdf.js";
import crearCarpeta from "../../utils/crearCarpetaSPO.js";
import { sacarMes } from "../../utils/sacarMes.js";
import subirArchivoGraphAPI from "../../utils/subirArchivoSPO.js";
import "dotenv/config";


async function diligenciaService(data_id, form_id, data) {
  try {
     // 📌 Extraer datos del formulario
     let zona = data.fields?.zonas?.result?.value?.code.trim() || "Zona Desconocida";
     let tipoDiligencia = data.fields.tipo_de_diligencia?.result?.value?.code.trim() ||"Diligencia Desconocida";
     let fechaDiligencia = data.fields.fecha_y_hora_de_la_visita?.result?.value?.date || "0000-00-00";
     let [year, month] = fechaDiligencia.split("-");
     
     const mes = await sacarMes(parseInt(month));
 
    const exportList = await obtenExportId(form_id);
    let exportId = null;    
    if (tipoDiligencia === "Visita Ocular") {
      exportId = exportList.find(exp => exp.name.includes("ocular"))?.id;
    } else if (tipoDiligencia === "Administrativa" || tipoDiligencia === "Jurídica Administrativa") {
      exportId = exportList.find(exp => exp.name.includes("Administrativas"))?.id;
    } else if (tipoDiligencia === "Jurídica Inquilino") {
      exportId = exportList.find(exp => exp.name.includes("Juridica"))?.id;
    }
    if (!exportId) {
      throw new Error(`No se encontró un exportId para el tipo de diligencia: ${tipoDiligencia}`);
    }

    console.log("📦 Export ID:", exportId);

    console.log(`Datos acta"+ ${data_id} + ${form_id} + ${exportId}`);
    const { buffer, fileName } = await getActaPdf(form_id, data_id, exportId);

    let rutaBase = "Visitas Generales";
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

export { diligenciaService };
