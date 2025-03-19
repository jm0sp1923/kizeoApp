import {obtenExportId} from '../utils/getExportId.js';
import getActaPdf from '../utils/getActaPdf.js';
import "dotenv/config";


async function previsitaService(data_id,form_name,form_id,data) {
    try {
        let zona = data?.fields?.zonas?.result;
        if(!zona){
            throw new Error(`El form ${form_name} no tiene zona`);
        }
        let exportId = await obtenExportId(form_id);

        let acta = await getActaPdf(form_id, data_id, exportId);
        console.log('🚀Acta de previsita:', acta);

    } catch (error) {
        console.error('❌ Error en el servicio:', error.message);
        throw new Error(error.message);
    }
}

export { previsitaService };