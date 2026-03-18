/**
 * Scheduler para envío automático de reportes históricos
 * 
 * Programa 3 envíos diarios:b
 *   - 3:00 AM  (Colombia / America/Bogota)
 *   - 11:00 AM
 *   - 4:00 PM
 * 
 */

import cron from "node-cron";
import enviarReporteHistoricos from "../services/Informes/enviarReporteHistoricos.js";

const TZ = process.env.TZ || "America/Bogota";
let schedulerIniciado = false;

/**
 * Ejecuta el envío del reporte y registra el resultado en consola
 * @param {string} etiqueta - Identificador del envío (ej: "3:00 AM")
 */
async function ejecutarEnvio(etiqueta) {
  console.log(`\n📧 [${etiqueta}] Iniciando envío programado de reporte histórico...`);
  console.log(`   Hora del servidor: ${new Date().toISOString()}`);

  try {
    const resultado = await enviarReporteHistoricos();
    console.log(`✅ [${etiqueta}] ${resultado}`);
  } catch (error) {
    console.error(`❌ [${etiqueta}] Error en envío programado:`, error.message);
  }
}

/**
 * Inicializa los 3 cron jobs para envío de reportes
 */
function iniciarScheduler() {
  if (schedulerIniciado) return;
  schedulerIniciado = true;

  console.log("⏰ Iniciando scheduler de reportes históricos...");
  console.log(`   Zona horaria: ${TZ}`);
  console.log("   Horarios programados: 3:00 AM, 11:00 AM, 4:00 PM\n");

  // ── Envío 1: 3:00 AM ──────────────────────────────────
  // Cron: segundo minuto hora día mes díaSemana
  cron.schedule("0 3 * * *", () => {
    ejecutarEnvio("Envío 3:00 AM");
  }, {
    timezone: TZ,
    scheduled: true,
  });

  // ── Envío 2: 11:00 AM ─────────────────────────────────
  cron.schedule("0 11 * * *", () => {
    ejecutarEnvio("Envío 11:00 AM");
  }, {
    timezone: TZ,
    scheduled: true,
  });

  // ── Envío 3: 4:00 PM ──────────────────────────────────
  cron.schedule("0 16 * * *", () => {
    ejecutarEnvio("Envío 4:00 PM");
  }, {
    timezone: TZ,
    scheduled: true,
  });

  console.log("✅ Scheduler de reportes históricos activo.\n");
}

export default iniciarScheduler;