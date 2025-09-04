import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // Guarda en carpeta temporal "uploads/"

import {
  subirActaController,
  getListKizeoController,
  updateListController,
  fusionarArchivosController,
  crearReporteController,
  enviarReporteController,
  updateHistoricoController,
  enviarReporteHistoricoController,
} from "../controllers/kizeoController.js";

//Ruta para el manejo de las actas al sharepoint
router.post("/webhook", subirActaController);

router.post("/reportes", crearReporteController);

router.post("/enviar_reportes", enviarReporteController);

// Ruta para obtener las listas desde la API externa
router.get("/lists", getListKizeoController);

// Ruta para actualizar la lista de kizeo desde un archivo excel
router.post("/updatelist", upload.single("excelFile"), updateListController);

router.post(
  "/fusionarExcel",
  upload.fields([
    { name: "reporteAfianzado", maxCount: 1 },
    { name: "baseCartera", maxCount: 1 },
  ]),
  fusionarArchivosController
);

router.post(
  "/updateHistorico",
  updateHistoricoController
);

router.post(
  "/enviarHistorico",
  enviarReporteHistoricoController
);

import { kizeoVisitasWebhookController } from "../controllers/kizeoVisitasController.js";

// Webhook dedicado a VISITAS (no colisiona con tu /webhook existente)
router.post("/webhook/visitas", kizeoVisitasWebhookController);

import {
  generarExcelVisitasAyerController,
  generarExcelVisitasPorFechaController,
} from "../controllers/visitasReportController.js";

// Genera Excel con los registros de AYER
router.post("/reportes/visitas/ayer", generarExcelVisitasAyerController);

// (opcional) Genera Excel por fecha específica
router.post("/reportes/visitas", generarExcelVisitasPorFechaController); // ?date=YYYY-MM-DD


export default router;
