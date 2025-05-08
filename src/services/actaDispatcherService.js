
import { previsitaService } from "./servicesActas/previsitaService.js";
import { entregaConPrevisitaService } from "./servicesActas/entregaConPrevisitaService.js";
import { entregaSinPrevisitaService } from "./servicesActas/entregaSinPrevisitaService.js";
import { subirActaInventarioService } from "./servicesActas/inventarioService.js";
import { diligenciaService } from "./servicesActas/diligenciasService.js";
// import { subirActaVisitasMensualesService } from "./visitasMensualesService.js";

import { guardarLog } from "../utils/guardarLogs.js";

const folderMap = {
  1071447: "previsita",
  1071742: "entrega_con_previsita",
  1071029: "entrega_sin_previsita",
  1052165: "inventario_inmuebles",
  1056420: "formulario_para_diligencias",
  1066665: "formulario_visitas_mensuales",
};

const actaServices = {
  previsita: previsitaService,
  entrega_con_previsita: entregaConPrevisitaService,
  entrega_sin_previsita: entregaSinPrevisitaService,
  inventario_inmuebles: subirActaInventarioService,
  formulario_para_diligencias: diligenciaService,
//   formulario_visitas_mensuales: subirActaVisitasMensualesService,
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
