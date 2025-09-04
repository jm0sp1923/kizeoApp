import { guardarVisitaDesdeWebhook } from "../services/visitasService.js";

export async function kizeoVisitasWebhookController(req, res) {
  try {
    // seguridad opcional
    const secret = process.env.KIZEO_WEBHOOK_SECRET;
    if (secret && req.get("x-webhook-secret") !== secret) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }

    const result = await guardarVisitaDesdeWebhook(req.body || {});
    return res.status(200).json({ ok: true, ...result });
  } catch (e) {
    console.error("Webhook error:", e);
    return res.status(500).json({ ok: false, error: "internal_error" });
  }
}
