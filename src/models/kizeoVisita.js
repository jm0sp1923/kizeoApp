import mongoose from "mongoose";

const VisitaSchema = new mongoose.Schema({
  // === columnas exactas de tu plantilla ===
  Cuenta: String,
  "Tipo de gestion": String,
  "Resultado": String,              // primer Resultado (grupo AL_IN / AL_LU / VISIT)
  "Fecha de gestion": Date,
  "Observacion": String,
  "fecha de proxima gestion": String, // según tu mapeo: misma observación
  "proxima gestion": String,          // vacío por ahora
  "Resultado 2": String,              // segundo Resultado (grupo INMUB...CONTA)
  "Tipo llamada": { type: String, default: "M" },
  "Duracion llamada": String,         // segundos
  "telefono": String,
  "empresa": String,

  // auditoría
  raw: Object,
}, { timestamps: true });

export default mongoose.model("KizeoVisita", VisitaSchema, "KizeoVisita");
