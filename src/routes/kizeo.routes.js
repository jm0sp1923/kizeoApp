import express from "express";
import multer from 'multer';
const router = express.Router();


const upload = multer({ dest: 'uploads/' }); // Guarda en carpeta temporal "uploads/"

import { subirActaController,getListKizeoController,updateListController } from "../controllers/kizeoController.js";

//Ruta para el manejo de las actas al sharepoint
router.post("/webhook", subirActaController);

// Ruta para obtener las listas desde la API externa
router.get('/lists',getListKizeoController )

router.post('/updatelist',upload.single('excelFile'), updateListController)

export default router;