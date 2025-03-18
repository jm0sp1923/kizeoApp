import fs from 'fs';
import path from 'path';
import "dotenv/config";

// Mapear los formularios con sus carpetas
const folderMap = {
    '1022053': 'previsita',  
    '1037778': 'entrega_con_previsita',  
    '1041013': 'entrega_sin_previsita',  
    '1052165': 'inventario_inmuebles',
    '1056420': 'formulario_para_diligencias',
    '1066665': 'formulario_visitas_mensuales',	  
};

// Función para guardar logs en archivos JSON
const guardarLog = (form_name, data) => {
    try {
        const logDir = path.join(process.cwd(), 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filePath = path.join(logDir, `formulario_${form_name}_${timestamp}.json`);

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

        console.log(`📁 Datos guardados en: ${filePath}`);
    } catch (error) {
        console.error('❌ Error guardando el log:', error.message);
    }
};

async function subirActaService(data) {
    try {
        console.log("📥 Datos recibidos:", JSON.stringify(data, null, 2));

        const { data: { form_id: form_id} } = data;
        
        console.log('📝 Form ID:', form_id);

        let form_name = folderMap[form_id];

        guardarLog(form_name, data);

    } catch (error) {
        console.error('❌ Error en el servicio:', error.message);
        throw new Error(error.message);
    }
}

export { subirActaService };
