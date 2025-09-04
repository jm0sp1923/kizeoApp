// src/services/graphMail.service.js
import axios from "axios";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const {
  TENANT_ID_AD,
  CLIENT_ID_AD,
  CLIENT_SECRET_AD,
  GRAPH_SCOPE = "https://graph.microsoft.com/.default",
  MAIL_DEFAULT_FROM,
  MAIL_DEFAULT_TO,
} = process.env;

// Token app (client credentials)
async function getGraphToken() {
  const url = `https://login.microsoftonline.com/${TENANT_ID_AD}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: CLIENT_ID_AD,
    client_secret: CLIENT_SECRET_AD,
    scope: GRAPH_SCOPE,
    grant_type: "client_credentials",
  });
  const { data } = await axios.post(url, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data.access_token;
}

/**
 * Envía correo via Graph con adjunto (<= ~3-4 MB en este método).
 * @param {Object} opts
 * @param {string} opts.from       Emisor (UPN o correo del buzón: user@dominio.com)
 * @param {string|string[]} opts.to Lista de destinatarios (string con comas o array)
 * @param {string} [opts.cc]
 * @param {string} [opts.bcc]
 * @param {string} opts.subject
 * @param {string} [opts.text]
 * @param {string} [opts.html]
 * @param {string} [opts.filePath] Ruta al adjunto (opcional)
 */
export async function graphSendMail(opts) {
  const token = await getGraphToken();

  const from = (opts.from || MAIL_DEFAULT_FROM || "").trim();
  if (!from) throw new Error("from requerido (MAIL_DEFAULT_FROM o body.from)");

  const normList = (val) =>
    !val
      ? []
      : Array.isArray(val)
      ? val
      : String(val)
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean);

  const toRecipients = normList(opts.to || MAIL_DEFAULT_TO).map((addr) => ({
    emailAddress: { address: addr },
  }));
  const ccRecipients = normList(opts.cc).map((addr) => ({
    emailAddress: { address: addr },
  }));
  const bccRecipients = normList(opts.bcc).map((addr) => ({
    emailAddress: { address: addr },
  }));

  if (!toRecipients.length) throw new Error("to requerido (MAIL_DEFAULT_TO o body.to)");

  const attachments = [];
  if (opts.filePath) {
    const contentBytes = fs.readFileSync(opts.filePath).toString("base64");
    attachments.push({
      "@odata.type": "#microsoft.graph.fileAttachment",
      name: path.basename(opts.filePath),
      contentType: mime.lookup(opts.filePath) || "application/octet-stream",
      contentBytes,
    });
  }

  const message = {
    subject: opts.subject || "Reporte Visitas",
    body: {
      contentType: opts.html ? "HTML" : "Text",
      content: opts.html || opts.text || "Adjunto reporte de visitas.",
    },
    toRecipients,
    ccRecipients,
    bccRecipients,
    // Nota: en /users/{from}/sendMail, "from" se infiere del buzón en la URL
    attachments,
  };

  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`;
  await axios.post(
    url,
    { message, saveToSentItems: true },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return { ok: true };
}
