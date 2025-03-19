import { procesarActa } from "../services/actaDispatcherService.js";

const subirActaController = async (req, res) => {
  try {
    const response = await procesarActa(req.body.data);
    res.status(200).json({ message: response });
  } catch (error) {
    res.status(400).json({ message: "Error al subir el acta: " + error.message });
  }
};

export { subirActaController };
