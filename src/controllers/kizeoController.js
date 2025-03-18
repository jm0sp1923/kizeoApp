import { subirActaService } from '../services/kizeoServices.js';

const subirActaController = async (req, res) => {    
    const {...data} = req.body;
    try {
        let response = await subirActaService(data);
        res.status(200).json({message: response});
    }
    catch (error) {
        res.status(400).json({message: 'Error al subir el acta'});
    }

}

export { subirActaController };