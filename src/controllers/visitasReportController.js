// src/controllers/visitasReportController.js
import { generarExcelVisitasAyer, generarExcelVisitasPorFecha } from "../services/visitasReportService.js";

export async function generarExcelVisitasAyerController(req, res) {
  try {
    const file = await generarExcelVisitasAyer();
    return res.json({ ok: true, file });
  } catch (e) {
    console.error("generarExcelVisitasAyerController:", e);
    return res.status(400).json({ ok: false, error: e.message });
  }
}

// opcional: por fecha específica (?date=YYYY-MM-DD)
export async function generarExcelVisitasPorFechaController(req, res) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ ok: false, error: "falta ?date=YYYY-MM-DD" });
    const file = await generarExcelVisitasPorFecha(date);
    return res.json({ ok: true, file });
  } catch (e) {
    console.error("generarExcelVisitasPorFechaController:", e);
    return res.status(400).json({ ok: false, error: e.message });
  }
}
