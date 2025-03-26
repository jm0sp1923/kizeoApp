
import { previsitaService } from "./previsitaService.js";
import { entregaConPrevisitaService } from "./entregaConPrevisitaService.js";
import { entregaSinPrevisitaService } from "./entregaSinPrevisitaService.js";
// import { subirActaInventarioService } from "./inventarioService.js";
import { diligenciaService } from "./diligenciasService.js";
// import { subirActaVisitasMensualesService } from "./visitasMensualesService.js";

const folderMap = {
  1022053: "previsita",
  1037778: "entrega_con_previsita",
  1041013: "entrega_sin_previsita",
  1052165: "inventario_inmuebles",
  1056420: "formulario_para_diligencias",
  1066665: "formulario_visitas_mensuales",
};

const actaServices = {
  previsita: previsitaService,
  entrega_con_previsita: entregaConPrevisitaService,
  entrega_sin_previsita: entregaSinPrevisitaService,
//   inventario_inmuebles: subirActaInventarioService,
 formulario_para_diligencias: diligenciaService,
//   formulario_visitas_mensuales: subirActaVisitasMensualesService,
};



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


const procesarActa = async (data) => {
  
  const form_name = folderMap[data.form_id];

  guardarLog(form_name, data);

  console.log("Servicio correspondiente:", form_name);

  if (!form_name || !actaServices[form_name]) {
    throw new Error("No se encontró un servicio para el formulario");
  }

  return await actaServices[form_name](data.id, data.form_id,data);
};

export { procesarActa };
