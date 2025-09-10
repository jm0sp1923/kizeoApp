import mongoose from "mongoose";

const VisitaSchema = new mongoose.Schema({
  // === columnas exactas de tu plantilla ===
  Cuenta: String,
  "Tipo de gestion": String,
  "Resultado de gestion": String,              // primer Resultado (grupo AL_IN / AL_LU / VISIT)
  "Fecha de gestion": Date,
  "Observacion": String,
  "Fecha de proxima gestion": String, // según tu mapeo: misma observación
  "Proxima gestion": String,          // vacío por ahora
  "Detalle": String,              // segundo Resultado (grupo INMUB...CONTA)
  "Tipo llamada": { type: String, default: "M" },
  "Duracion llamada": String,         // segundos
  "Telefono": String,
  "Empresa": String,

  // auditoría
  raw: Object,
}, { timestamps: true });

export default mongoose.model("KizeoVisita", VisitaSchema, "KizeoVisita");
