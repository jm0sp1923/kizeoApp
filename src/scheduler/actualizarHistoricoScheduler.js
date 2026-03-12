/**
 * Scheduler para actualización automática del histórico en MongoDB
 *
 * Programa 3 actualizaciones diarias (30 min antes del envío de reportes):
 *   - 2:55 AM  (Colombia / America/Bogota)
 *   - 10:55 AM
 *   - 3:55 PM
 */

import cron from "node-cron";
import updateHistoricoDb from "../services/Informes/actulizarHistoricoDb.js";

const TZ = process.env.TZ || "America/Bogota";

async function ejecutarActualizacion(etiqueta) {
  console.log(`\n🔄 [${etiqueta}] Iniciando actualización del histórico en MongoDB...`);
  console.log(`   Hora del servidor: ${new Date().toISOString()}`);

  try {
    const resultado = await updateHistoricoDb();
    console.log(`✅ [${etiqueta}] ${resultado}`);
  } catch (error) {
    console.error(`❌ [${etiqueta}] Error en actualización programada:`, error.message);
  }
}

function iniciarSchedulerActualizacion() {
  console.log("⏰ Iniciando scheduler de actualización del histórico...");
  console.log(`   Zona horaria: ${TZ}`);
  console.log("   Horarios programados: 2:55 AM, 10:55 AM, 3:55 PM\n");

  // ── Actualización 1: 2:55 AM ──────────────────────────────────
  cron.schedule("55 2 * * *", () => {
    ejecutarActualizacion("Actualización 2:55 AM");
  }, {
    timezone: TZ,
    scheduled: true,
  });

  // ── Actualización 2: 10:55 AM ─────────────────────────────────
  cron.schedule("55 10 * * *", () => {
    ejecutarActualizacion("Actualización 10:55 AM");
  }, {
    timezone: TZ,
    scheduled: true,
  });

  // ── Actualización 3: 3:55 PM ──────────────────────────────────
  cron.schedule("55 15 * * *", () => {
    ejecutarActualizacion("Actualización 3:55 PM");
  }, {
    timezone: TZ,
    scheduled: true,
  });

  console.log("✅ Scheduler de actualización del histórico activo.\n");
}

export default iniciarSchedulerActualizacion;
