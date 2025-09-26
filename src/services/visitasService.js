// src/services/visitasService.js

// Dayjs con plugins
import dayjsBase from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import customParseFormat from "dayjs/plugin/customParseFormat.js";
dayjsBase.extend(utc); dayjsBase.extend(timezone); dayjsBase.extend(customParseFormat);
const dayjs = dayjsBase;
const TZ = process.env.TZ || "America/Bogota";

import KizeoVisita from "../models/kizeoVisita.js";

/* ===== helpers Kizeo v4 ===== */
const field = (fields, name) => fields?.[name]?.result ?? null;
const valueOf = (fields, name) => field(fields, name)?.value ?? null;
const textOf = (fields, name) => {
  const v = valueOf(fields, name);
  if (v == null) return undefined;
  if (typeof v === "string") return v;
  if (typeof v === "object" && v.text != null) return String(v.text);
  return undefined;
};
const codeOf = (fields, name) => {
  const v = valueOf(fields, name);
  if (v && typeof v === "object" && v.code != null) return String(v.code).trim();
  return undefined;
};
const phoneOf = (fields, name) => {
  const v = valueOf(fields, name);
  if (v == null) return undefined;
  return typeof v === "string" ? v : (v.text ? String(v.text) : undefined);
};
const firstNonEmpty = (...arr) => {
  for (const v of arr) if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  return undefined;
};

const codeOrText = (fields, name) => {
  const v = valueOf(fields, name);
  if (v == null) return undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t !== "" ? t : undefined;
  }
  if (typeof v === "object") {
    if (v.code != null) {
      const t = String(v.code).trim();
      return t !== "" ? t : undefined;
    }
    if (v.text != null) {
      const t = String(v.text).trim();
      return t !== "" ? t : undefined;
    }
  }
  return undefined;
};

// fecha desde {date, hour, timezone}
const dateTimeFromKizeo = (v) => {
  if (!v || typeof v !== "object") return null;
  const date = v.date;
  const hour = v.hour || "00:00:00";
  const tz = v.timezone; // ej: "-05:00"

  let d;
  if (tz) {
    const iso = `${date}T${hour}${tz}`; // "YYYY-MM-DDTHH:mm:ss-05:00"
    d = dayjs(iso);
  } else {
    d = dayjs.tz(`${date} ${hour}`, "YYYY-MM-DD HH:mm:ss", TZ);
  }
  return d.isValid() ? d.toDate() : null;
};

// parse suelto por si llega en plano (respeta segundos si trae offset/Z)
const parseDateLoose = (s) => {
  if (!s) return null;
  const str = String(s).trim();

  // Si trae offset o Z, NO fuerces TZ: conserva segundos exactos
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})$/.test(str)) {
    const d = dayjs(str);
    return d.isValid() ? d.toDate() : null;
  }

  // Planos -> interprétalos en la TZ del sistema
  const fmts = [
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DD HH:mm",
    "YYYY/MM/DD HH:mm:ss",
    "YYYY-MM-DD"
  ];
  for (const f of fmts) {
    const d = dayjs.tz(str, f, TZ);
    if (d.isValid()) return d.toDate();
  }

  const d = dayjs.tz(str, TZ);
  return d.isValid() ? d.toDate() : null;
};

export async function guardarVisitaDesdeWebhook(payload) {
  const fields = payload?.data?.fields || payload?.fields || {};
  const flat   = payload?.data || payload || {};

  // ✅ SOLO procesar Visita Ocular
  const tipoDiligencia =
    (codeOf(fields, "tipo_de_diligencia") ||
     textOf(fields, "tipo_de_diligencia") ||
     flat?.tipo_de_diligencia ||
     "").trim();

  if (tipoDiligencia.toLowerCase() !== "visita ocular") {
    console.log("Webhook ignorado: tipo_de_diligencia =", tipoDiligencia);
    return { ok: true, skipped: true, reason: "tipo_de_diligencia != 'Visita Ocular'" };
  }

  // Cuenta
  const Cuenta = firstNonEmpty(codeOf(fields, "cuenta"), flat.cuenta);

  // Tipo de gestion -> SOLO el código que envían en ##codigo_lugar_visita##
  const TipoDeGestion = firstNonEmpty(
    textOf(fields, "codigo_lugar_visita"),
    flat.codigo_lugar_visita
  );

  // Resultado de gestion
  const Resultado_de_gestion = firstNonEmpty(
    textOf(fields, "codigo_resultado_visita_al_in"),
    textOf(fields, "codigo_resultado_visita_al_lu"),
    textOf(fields, "resultado_de_la_gestion_visit"),
    flat.codigo_resultado_visita_al_in,
    flat.codigo_resultado_visita_al_lu,
    flat.resultado_de_la_gestion_visit
  );

  // ===== FECHAS =====
  // 1) Fecha de la VISITA (formulario)
  const vFechaVisita = valueOf(fields, "fecha_y_hora_de_la_visita"); // {date,hour,timezone}
  const FechaVisita =
    dateTimeFromKizeo(vFechaVisita) ||
    parseDateLoose(flat.fecha_y_hora_de_la_visita) ||
    null;

  // 2) Fecha de registro real (cuando finaliza la visita)
  // Prioriza update_answer_time > answer_time (ambas traen segundos)
  const registroRaw =
    payload?.data?.update_answer_time ||
    payload?.data?.answer_time ||
    payload?.update_answer_time ||
    payload?.answer_time ||
    flat?.update_answer_time ||
    flat?.answer_time ||
    null;

  const FechaRegistro = parseDateLoose(registroRaw) || new Date();

  // 3) Inicio real: si existe start_answer_time, úsalo; si no, usa la fecha del formulario
  const startRaw = flat?.start_answer_time || payload?.start_answer_time || null;
  const FechaInicio = parseDateLoose(startRaw) || FechaVisita || null;

  // Observacion
  let Observacion = firstNonEmpty(
    textOf(fields, "observacion_de_la_visita1"),
    flat.observacion_de_la_visita1
  );

  if (Observacion) {
  Observacion = Observacion
    .replace(/;/g, ",")        // reemplaza punto y coma por coma
    .replace(/\s*,\s*/g, ", ") // asegura un espacio limpio después de cada coma
    .trim();                   // elimina espacios al inicio y final
  }

  const FechaProximaGestion = "";
  const ProximaGestion = "";

  // ✅ Detalle — SOLO un código: el PRIMERO no vacío de la lista (sin concatenar)
  const Detalle = firstNonEmpty(
    // Prioridad: campos dentro de fields
    codeOrText(fields, "codigo_resultado_visita_inmub"),
    codeOrText(fields, "codigo_resultado_visita_inmue"),
    codeOrText(fields, "codigo_resultado_visita_al_in1"),
    codeOrText(fields, "codigo_resultado_visita_al_in3"),
    codeOrText(fields, "codigo_resultado_visita_traba"),
    codeOrText(fields, "codigo_resultado_visita_traba1"),
    codeOrText(fields, "codigo_resultado_visita_traba2"),
    codeOrText(fields, "resultado_de_la_gestion_conta2"),
    codeOrText(fields, "resultado_de_la_gestion_conta"),

    // Fallbacks “planos”
    flat?.codigo_resultado_visita_inmub,
    flat?.codigo_resultado_visita_inmue,
    flat?.codigo_resultado_visita_al_in1,
    flat?.codigo_resultado_visita_al_in3,
    flat?.codigo_resultado_visita_traba,
    flat?.codigo_resultado_visita_traba1,
    flat?.codigo_resultado_visita_traba2,
    flat?.resultado_de_la_gestion_conta2,
    flat?.resultado_de_la_gestion_conta
  ) || "";

  // Tipo llamada
  const TipoLlamada = "M";

  // Duración = FechaRegistro - FechaInicio en HH:mm:ss
  let DuracionLlamada = "00:00:00";

  if (FechaRegistro && FechaInicio) {
    const diffMs = FechaRegistro.getTime() - FechaInicio.getTime(); // NO usar Math.abs

    if (diffMs > 0) {
      const totalSec = Math.floor(diffMs / 1000);
      const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
      const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
      const ss = String(totalSec % 60).padStart(2, "0");
      DuracionLlamada = `${hh}:${mm}:${ss}`;
    } else {
      // fin antes o igual que inicio ⇒ duración cero
      DuracionLlamada = "00:00:00";
    }
  }

  console.log("FechaVisita ISO  =", FechaVisita?.toISOString?.());
  console.log("FechaInicio ISO  =", FechaInicio?.toISOString?.());
  console.log("FechaRegistro ISO =", FechaRegistro?.toISOString?.());
  console.log("⏱ DuracionLlamada CALCULADA =", DuracionLlamada);

  // Telefono
  const Telefono = firstNonEmpty(
    phoneOf(fields, "celular_del_inquilino"),
    flat.celular_del_inquilino
  );

  // Empresa
  let Empresa = textOf(fields, "empresa");
  if (Empresa == null && typeof flat.Empresa === "string") Empresa = flat.Empresa;
  Empresa = (typeof Empresa === "string" && Empresa.trim() !== "") ? Empresa.trim() : "";

  // Documento final
  const doc = {
    Cuenta,
    "Tipo de gestion": TipoDeGestion || "",
    "Resultado de gestion": Resultado_de_gestion || "",
    "Fecha de gestion": FechaRegistro || null,
    "Observacion": Observacion || "",
    "Fecha de proxima gestion": FechaProximaGestion,
    "Proxima gestion": ProximaGestion,
    "Detalle": Detalle || "",
    "Tipo llamada": TipoLlamada,
    "Duracion llamada": DuracionLlamada,
    "Telefono": Telefono || "",
    "Empresa": Empresa || "",
    raw: payload,
  };

  console.log("Visita recibida:", {
    Cuenta, TipoDeGestion, Resultado_de_gestion,
    FechaVisita, FechaInicio, FechaRegistro,
    Observacion, Detalle, Telefono, Empresa
  });

  const r = await KizeoVisita.create(doc);
  return { ok: true, mode: "insert", id: r._id.toString() };
}
