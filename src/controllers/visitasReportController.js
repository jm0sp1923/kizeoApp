// src/controllers/visitasReportController.js
import {
  generarExcelVisitasAyer,
  generarExcelVisitasPorFecha,
} from "../services/visitasReportService.js";
import { graphSendMail } from "../services/graphMailService.js";
import KizeoVisita from "../models/kizeoVisita.js";

import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjsBase.extend(utc); dayjsBase.extend(timezone);
const dayjs = dayjsBase;
const TZ = process.env.TZ || "America/Bogota";

import { normalizeDate, visitasEmailHTML } from "../utils/mailTemplates.js";

// helper: cuenta registros por fecha (zona Bogotá)
async function countVisitasByDate(yyyy_mm_dd) {
  const start = dayjs.tz(yyyy_mm_dd, TZ).startOf("day");
  const next  = start.add(1, "day");
  return KizeoVisita.countDocuments({
    "Fecha de gestion": { $gte: start.toDate(), $lt: next.toDate() },
  });
}

export async function generarExcelVisitasAyerController(req, res) {
  try {
    const file = await generarExcelVisitasAyer();
    return res.json({ ok: true, file });
  } catch (e) {
    console.error("generarExcelVisitasAyerController:", e);
    return res.status(400).json({ ok: false, error: e.message });
  }
}

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

export async function enviarExcelVisitasAyerController(req, res) {
  try {
    const dateSlug = dayjs().tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
    const file = await generarExcelVisitasPorFecha(dateSlug);
    const total = await countVisitasByDate(dateSlug);

    const { pretty } = normalizeDate(dateSlug);
    const subject = req.body?.subject || `Reporte Visitas – ${pretty}`;
    const html = visitasEmailHTML({
      prettyDate: pretty,
      total,
      footerNote: req.body?.footer,
    });

    const { from, to, cc, bcc, text } = req.body || {};
    await graphSendMail({ from, to, cc, bcc, subject, html, text, filePath: file });

    return res.json({ ok: true, file, sent: true, total, date: dateSlug, via: "graph" });
  } catch (e) {
    console.error("enviarExcelVisitasAyerController:", e);
    return res.status(400).json({ ok: false, error: e.message });
  }
}

export async function enviarExcelVisitasPorFechaController(req, res) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ ok: false, error: "falta ?date=YYYY-MM-DD" });

    const file = await generarExcelVisitasPorFecha(date);
    const total = await countVisitasByDate(date);

    const { pretty } = normalizeDate(date);
    const subject = req.body?.subject || `Reporte Visitas – ${pretty}`;
    const html = visitasEmailHTML({
      prettyDate: pretty,
      total,
      footerNote: req.body?.footer,
    });

    const { from, to, cc, bcc, text } = req.body || {};
    await graphSendMail({ from, to, cc, bcc, subject, html, text, filePath: file });

    return res.json({ ok: true, file, sent: true, total, date, via: "graph" });
  } catch (e) {
    console.error("enviarExcelVisitasPorFechaController:", e);
    return res.status(400).json({ ok: false, error: e.message });
  }
}
