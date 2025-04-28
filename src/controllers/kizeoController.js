import { procesarActa } from "../services/actaDispatcherService.js";
import getListServices from "../services/getListServices.js";
import updateListServices from "../services/updateListServices.js";

const subirActaController = async (req, res) => {
  try {
    const response = await procesarActa(req.body.data);
    res.status(200).json({ message: response });
  } catch (error) {
    res.status(400).json({ message: "Error al subir el acta: " + error.message });
  }
};


const getListKizeoController = async (req, res) => {
  try {
    const response = await getListServices();
    res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ message: "Error al obtener la lista de Kizeo: " + error.message });
  };
}

const updateListController = async (req, res) => {
  try {
    const { listType } = req.body;
    const file = req.file;
    
    const result = await updateListServices(listType, file);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: "Error al subir el acta: " + error.message });
  }
};

export  { subirActaController,getListKizeoController,updateListController};
