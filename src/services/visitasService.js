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
    // Si Kizeo trae offset, construimos ISO y NO pasamos TZ para evitar doble aplicación
    const iso = `${date}T${hour}${tz}`; // "YYYY-MM-DDTHH:mm:ss-05:00"
    d = dayjs(iso);
  } else {
    // Sin offset: interpretamos en la zona del servidor (Bogotá por defecto)
    d = dayjs.tz(`${date} ${hour}`, "YYYY-MM-DD HH:mm:ss", TZ);
  }
  return d.isValid() ? d.toDate() : null;
};

// parse suelto por si llega en plano
const parseDateLoose = (s) => {
  if (!s) return null;
  const fmts = [
    "YYYY-MM-DD HH:mm",
    "YYYY-MM-DD HH:mm:ss",
    "YYYY-MM-DDTHH:mm:ssZ",
    "YYYY-MM-DD",
    "YYYY/MM/DD HH:mm:ss"
  ];
  for (const f of fmts) {
    const d = dayjs.tz(String(s).trim(), f, TZ);
    if (d.isValid()) return d.toDate();
  }
  const d = dayjs.tz(String(s).trim(), TZ);
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
  const Cuenta = firstNonEmpty(
    codeOf(fields, "cuenta"),
    flat.cuenta
  );

  // Tipo de gestion -> SOLO el código que envían en ##codigo_lugar_visita##
  const TipoDeGestion = firstNonEmpty(
    textOf(fields, "codigo_lugar_visita"), // "0042 " (queda trim con firstNonEmpty)
    flat.codigo_lugar_visita
  );

  // Resultado (1)
  const Resultado1 = firstNonEmpty(
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

  //  2) Fecha de registro real (cuando finaliza la visita)
  const registroRaw =
    payload?.data?.update_answer_time ||
    payload?.update_answer_time ||
    flat?.update_answer_time ||
    payload?.data?.answer_time ||
    payload?.answer_time ||
    flat?.answer_time ||
    null;

  const FechaRegistro = parseDateLoose(registroRaw) || new Date();

  // Observacion
  const Observacion = firstNonEmpty(
    textOf(fields, "observacion_de_la_visita1"),
    flat.observacion_de_la_visita1,
    flat.observacion
  );

  const FechaProximaGestion = ""; // vacío
  const ProximaGestion = "";      // vacío

// Resultado (2) — SOLO tomamos el valor de codigo_resultado_visita_inmub
const Resultado2 =
  codeOrText(fields, "codigo_resultado_visita_inmub") ||
  flat?.codigo_resultado_visita_inmub ||
  "";

  // Tipo llamada
  const TipoLlamada = "M";

  // Duración (minutos) = FechaRegistro - FechaVisita
  let DuracionLlamada = "00:00";
  if (FechaRegistro && FechaVisita) {
    const deltaMs = FechaRegistro.getTime() - FechaVisita.getTime();
    const totalMinutos = Math.max(0, Math.round(deltaMs / 60000));
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;

    // Formatea en HH:mm siempre con dos dígitos
    const hh = String(horas).padStart(2, "0");
    const mm = String(minutos).padStart(2, "0");

    DuracionLlamada = `${hh}:${mm}`;
  }

  // telefono
  const telefono = firstNonEmpty(
    phoneOf(fields, "celular_del_inquilino"),
    flat.celular_del_inquilino, flat.telefono, flat.phone
  );

  // empresa
  let empresa = textOf(fields, "empresa");
  if (empresa == null && typeof flat.empresa === "string") empresa = flat.empresa;
  empresa = (typeof empresa === "string" && empresa.trim() !== "") ? empresa.trim() : "";

  // Documento final
  const doc = {
    Cuenta,
    "Tipo de gestion": TipoDeGestion || "",
    "Resultado": Resultado1 || "",
    "Fecha de gestion": FechaRegistro || null,
    "Observacion": Observacion || "",
    "fecha de proxima gestion": FechaProximaGestion,
    "proxima gestion": ProximaGestion,
    "Resultado 2": Resultado2 || "",
    "Tipo llamada": TipoLlamada,
    "Duracion llamada": DuracionLlamada,
    "telefono": telefono || "",
    "empresa": empresa || "",
    raw: payload,
  };

  console.log("Visita recibida:", {
    Cuenta, TipoDeGestion, Resultado1,
    FechaVisita, FechaRegistro,
    Observacion, Resultado2, telefono, empresa
  });

  const r = await KizeoVisita.create(doc);
  return { ok: true, mode: "insert", id: r._id.toString() };
}
