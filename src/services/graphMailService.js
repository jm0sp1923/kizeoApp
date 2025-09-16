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
  MAIL_DEFAULT_CC,
  MAIL_DEFAULT_BCC,
} = process.env;

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

export async function graphSendMail(opts) {
  const token = await getGraphToken();

  const from = (opts.from || MAIL_DEFAULT_FROM || "").trim();
  if (!from) throw new Error("from requerido (MAIL_DEFAULT_FROM o body.from)");

  const normList = (val) =>
    !val
      ? []
      : Array.isArray(val)
      ? val
      : String(val).split(",").map((x) => x.trim()).filter(Boolean);

  const toRecipients = normList(opts.to ?? MAIL_DEFAULT_TO).map((addr) => ({
    emailAddress: { address: addr },
  }));
  const ccRecipients = normList(opts.cc ?? MAIL_DEFAULT_CC).map((addr) => ({
    emailAddress: { address: addr },
  }));
  const bccRecipients = normList(opts.bcc ?? MAIL_DEFAULT_BCC).map((addr) => ({
    emailAddress: { address: addr },
  }));

  if (!toRecipients.length) throw new Error("to requerido (MAIL_DEFAULT_TO o body.to)");

  // Soporta uno o varios adjuntos
  const files = [
    ...(opts.filePaths ? opts.filePaths : []),
    ...(opts.filePath ? [opts.filePath] : []),
  ];
  const attachments = files.map((fp) => ({
    "@odata.type": "#microsoft.graph.fileAttachment",
    name: path.basename(fp),
    contentType: mime.lookup(fp) || "application/octet-stream",
    contentBytes: fs.readFileSync(fp).toString("base64"),
  }));

  const message = {
    subject: opts.subject || "Reporte Visitas Oculares",
    body: {
      contentType: opts.html ? "HTML" : "Text",
      content: opts.html || opts.text || "Adjunto reporte de visitas.",
    },
    toRecipients,
    ccRecipients,
    bccRecipients,
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
