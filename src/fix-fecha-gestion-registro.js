import mongoose from "mongoose";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

// Ajusta el URI y la colección/modelo
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jm0sp1923:Jm0sp1923@cluster.okxhm1k.mongodb.net/kizeo";
const collection = "KizeoVisita"; // verifica el nombre real

function parseISO(s) {
  if (!s) return null;
  const d = dayjs(s); // soporta "2025-09-05T13:47:37-05:00"
  return d.isValid() ? d.toDate() : null;
}

function kizeoVisitDate(raw) {
  const v = raw?.data?.fields?.fecha_y_hora_de_la_visita?.result?.value;
  if (!v?.date) return null;
  const hour = v.hour || "00:00:00";
  const tz   = v.timezone || "+00:00";
  const iso  = `${v.date}T${hour}${tz}`;
  return parseISO(iso);
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const col = db.collection(collection);

  const cursor = col.find({}, { projection: { raw: 1, "Fecha de gestion": 1 } });

  let updated = 0, scanned = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    scanned++;

    const regRaw =
      doc?.raw?.data?.update_answer_time ??
      doc?.raw?.update_answer_time ??
      doc?.raw?.data?.answer_time ??
      doc?.raw?.answer_time ??
      null;

    const fechaRegistro = parseISO(regRaw);
    const fechaVisita   = kizeoVisitDate(doc?.raw);

    // Si no hay fecha de registro fiable, salta
    if (!fechaRegistro) continue;

    // Duración en minutos (mínimo 0)
    let mins = 0;
    if (fechaVisita) {
      const diffMs = fechaRegistro.getTime() - fechaVisita.getTime();
      mins = Math.max(0, Math.round(diffMs / 60000));
    }

    const res = await col.updateOne(
      { _id: doc._id },
      {
        $set: {
          "Fecha de gestion": fechaRegistro,
          "Duracion llamada": `${mins} minutos`,
        }
      }
    );

    if (res.modifiedCount > 0) updated++;
    if (scanned % 500 === 0) console.log(`Procesados ${scanned}, actualizados ${updated}`);
  }

  console.log(`\nListo. Escaneados: ${scanned}, actualizados: ${updated}`);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
