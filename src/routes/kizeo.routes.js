import express from "express";
import { subirActaController } from "../controllers/kizeoController.js";
const router = express.Router();

router.post("/webhook", subirActaController);

export default router;