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
const columnOf = (fields, name, i = 1) => {
  const v = valueOf(fields, name);
  const cols = v?.columns;
  if (Array.isArray(cols) && cols[i] != null) return String(cols[i]);
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

// fecha desde {date, hour, timezone}
const dateTimeFromKizeo = (v) => {
  if (!v || typeof v !== "object") return null;
  const date = v.date, hour = v.hour || "00:00:00", tz = v.timezone;
  const base = `${date} ${hour}`;
  const d = tz
    ? dayjs.tz(`${base} ${tz}`, "YYYY-MM-DD HH:mm:ss Z", TZ)
    : dayjs.tz(base, "YYYY-MM-DD HH:mm:ss", TZ);
  return d.isValid() ? d.toDate() : null;
};

// parse suelto por si llega en plano
const parseDateLoose = (s) => {
  if (!s) return null;
  const fmts = ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DDTHH:mm:ssZ", "YYYY-MM-DD", "YYYY/MM/DD HH:mm:ss"];
  for (const f of fmts) {
    const d = dayjs.tz(String(s).trim(), f, TZ);
    if (d.isValid()) return d.toDate();
  }
  const d = dayjs.tz(String(s).trim(), TZ);
  return d.isValid() ? d.toDate() : null;
};

export async function guardarVisitaDesdeWebhook(payload) {
  // El JSON real nos llega en data.fields (o en fields a nivel raíz)
  const fields = payload?.data?.fields || payload?.fields || {};
  const flat   = payload?.data || payload || {};

  // === Campos requeridos por tu plantilla ===

  // Cuenta
  const Cuenta = firstNonEmpty(
    codeOf(fields, "cuenta"),                // "1044"
    flat.cuenta
  );

  // Tipo de gestion
  const TipoDeGestion = firstNonEmpty(
    textOf(fields, "codigo_lugar_visita"),   // "0042 " (texto visible)
    codeOf(fields, "lugar_de_la_visita"),    // code "0042 "
    flat.codigo_lugar_visita
  );

  // Resultado (grupo 1)
  const Resultado1 = firstNonEmpty(
    textOf(fields, "codigo_resultado_visita_al_in"),
    textOf(fields, "codigo_resultado_visita_al_lu"),
    textOf(fields, "resultado_de_la_gestion_visit"),
    flat.codigo_resultado_visita_al_in,
    flat.codigo_resultado_visita_al_lu,
    flat.resultado_de_la_gestion_visit
  );

  // Fecha de gestion
  const vFecha = valueOf(fields, "fecha_y_hora_de_la_visita"); // {date, hour, timezone}
  const FechaDeGestion = dateTimeFromKizeo(vFecha) || parseDateLoose(flat.fecha_y_hora_de_la_visita) || null;

  // Observacion
  const Observacion = firstNonEmpty(
    textOf(fields, "observacion_de_la_visita1"),
    flat.observacion_de_la_visita1,
    flat.observacion
  );

  // fecha de proxima gestion  (según tu instrucción: igual a observación)
  const FechaProximaGestion = Observacion || "";

  // proxima gestion (vacío)
  const ProximaGestion = "";

  // Resultado (grupo 2)
  const Resultado2 = firstNonEmpty(
    textOf(fields, "codigo_resultado_visita_inmub"),
    textOf(fields, "codigo_resultado_visita_inmue"),
    textOf(fields, "codigo_resultado_visita_al_in1"),
    textOf(fields, "codigo_resultado_visita_al_in3"),
    textOf(fields, "resultado_de_la_gestion1"),
    textOf(fields, "codigo_resultado_visita_traba1"),
    textOf(fields, "codigo_resultado_visita_traba2"),
    textOf(fields, "resultado_de_la_gestion_conta2"),
    textOf(fields, "resultado_de_la_gestion_conta"),
    // fallback plano si viniera
    flat.codigo_resultado_visita_inmub,
    flat.codigo_resultado_visita_inmue,
    flat.codigo_resultado_visita_al_in1,
    flat.codigo_resultado_visita_al_in3,
    flat.resultado_de_la_gestion1,
    flat.codigo_resultado_visita_traba1,
    flat.codigo_resultado_visita_traba2,
    flat.resultado_de_la_gestion_conta2,
    flat.resultado_de_la_gestion_conta
  );

  // Tipo llamada
  const TipoLlamada = "M";

  // Duracion llamada = form_update_time - fecha_y_hora_de_la_visita (segundos)
  const formUpdate = parseDateLoose(payload?.form_update_time || flat?.form_update_time || flat?._update_time);
  // Calculamos duración en MINUTOS
  let DuracionLlamada = null;

  if (formUpdate && FechaDeGestion) {
    const minutos = Math.max(
      0,
      Math.round((formUpdate.getTime() - FechaDeGestion.getTime()) / 60000)
    );
    DuracionLlamada = `${minutos} minutos`;
  }

  // telefono
  const telefono = firstNonEmpty(
    phoneOf(fields, "celular_del_inquilino"),
    flat.celular_del_inquilino, flat.telefono, flat.phone
  );

  // empresa
  let empresa = textOf(fields, "empresa");
  if (empresa == null && typeof flat.empresa === "string") {
    empresa = flat.empresa; // fallback solo si viene plano (no v4)
  }
  // normalizamos: si es string vacío o espacios, lo guardamos vacío
  empresa = (typeof empresa === "string" && empresa.trim() !== "") ? empresa.trim() : "";


  // Construimos documento con SOLO las columnas pedidas
  const doc = {
    Cuenta,
    "Tipo de gestion": TipoDeGestion || "",
    "Resultado": Resultado1 || "",
    "Fecha de gestion": FechaDeGestion || null,
    "Observacion": Observacion || "",
    "fecha de proxima gestion": FechaProximaGestion || "",
    "proxima gestion": ProximaGestion,
    "Resultado 2": Resultado2 || "",
    "Tipo llamada": TipoLlamada,
    "Duracion llamada": DuracionLlamada,
    "telefono": telefono || "",
    "empresa": empresa || "",
    raw: payload, // auditoría
  };

  // Inserta SIEMPRE (no upsert)
  const r = await KizeoVisita.create(doc);
  return { ok: true, mode: "insert", id: r._id.toString() };
}
