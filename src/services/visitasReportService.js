// src/services/visitasReportService.js
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";

import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjsBase.extend(utc); dayjsBase.extend(timezone);
const dayjs = dayjsBase;

const TZ = process.env.TZ || "America/Bogota";

import KizeoVisita from "../models/kizeoVisita.js";

const HEADERS = [
  "Cuenta",
  "Tipo de gestion",
  "Resultado",
  "Fecha de gestion",
  "Observacion",
  "Fecha de proxima gestion",
  "Proxima gestion",
  "Resultado 2",
  "Tipo llamada",
  "Duracion llamada",
  "Telefono",
  "Empresa",
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirmkdirSync(p, { recursive: true });
}

function rangeForDate(yyyy_mm_dd) {
  const base = dayjs.tz(yyyy_mm_dd, TZ);
  if (!base.isValid()) throw new Error("fecha inválida (YYYY-MM-DD)");
  return { start: base.startOf("day").toDate(), end: base.endOf("day").toDate(), base };
}

async function fetchByDate(yyyy_mm_dd) {
  const { start, end } = rangeForDate(yyyy_mm_dd);
  return await KizeoVisita
    .find({ "Fecha de gestion": { $gte: start, $lte: end } })
    .sort({ "Fecha de gestion": 1 })
    .lean();
}

const fmtBogotaCorto = (d) => {
  if (!d) return "";
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: TZ,
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(d));
};

export async function generarExcelVisitasPorFecha(yyyy_mm_dd) {
  const { base } = rangeForDate(yyyy_mm_dd);
  const rows = await fetchByDate(yyyy_mm_dd);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Visitas");

  ws.addRow(HEADERS);

  for (const r of rows) {
    ws.addRow([
      r["Cuenta"] ?? "",
      r["Tipo de gestion"] ?? "",
      r["Resultado"] ?? "",
      fmtBogotaCorto(r["Fecha de gestion"]),
      r["Observacion"] ?? "",
      r["Fecha de proxima gestion"] ?? "",
      r["Proxima gestion"] ?? "",
      r["Resultado 2"] ?? "",
      r["Tipo llamada"] ?? "",
      r["Duracion llamada"] ?? "",
      r["Telefono"] ?? "",
      r["Empresa"] ?? "",
    ]);
  }

  // auto width
  ws.columns.forEach((c) => {
    let w = 12;
    c.eachCell({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? "").length + 2;
      if (len > w) w = len;
    });
    c.width = Math.min(w, 50);
  });

  const outDir = path.join(process.cwd(), "uploads", "reports");
  ensureDir(outDir);
  const file = path.join(outDir, `visitas_${base.format("YYYY-MM-DD")}.xlsx`);
  await wb.xlsx.writeFile(file);
  return file;
}

export async function generarExcelVisitasAyer() {
  const ayer = dayjs().tz(TZ).subtract(1, "day").format("YYYY-MM-DD");
  return generarExcelVisitasPorFecha(ayer);
}
