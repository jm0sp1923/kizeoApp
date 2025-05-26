import getAccessToken from "../../config/tokenTenant.js";
import axios from "axios";
import fs from "fs";
import historico from "../../models/historico.js";
import { generarExcelHistorico } from "../../utils/crearExcelReportes.js";
import emailHistorico from '../../template/emailReporteHistorico.js';
import remitentes from "../../models/remitentes.js";

function obtenerDiaAnteriorNoDomingo(fecha) {
  let diaAnterior = new Date(fecha);
  do {
    diaAnterior.setDate(diaAnterior.getDate() - 1);
  } while (diaAnterior.getDay() === 0); // 0 es domingo
  return diaAnterior;
}

function formatFechaSimple(fecha) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function enviarReporteHistoricos() {
  try {
    // Obtener día anterior no domingo
    const ayerNoDomingo = obtenerDiaAnteriorNoDomingo(new Date());

    // Crear regex para filtrar data._update_time que empieza con la fecha (YYYY-MM-DD)
    const fechaRegex = "^" + formatFechaSimple(ayerNoDomingo);

    // Buscar reportes en ese rango de fechas con _direction "received"
    const historicoReportes = await historico.find({
      "data._update_time": { $regex: fechaRegex },
      "data._direction": "received",
    });

    const fechaFormateada = ayerNoDomingo.toLocaleDateString();

    const htmlContent = emailHistorico(fechaFormateada);
    const archivoExcel = generarExcelHistorico(historicoReportes);

    const remitenteData = await remitentes.findOne({
      area: "RCI",
    });

    await enviarCorreo(htmlContent, remitenteData, archivoExcel);

    return `Correo con historicos enviado exitosamente.`;
  } catch (error) {
    throw new Error("Error al crear el reporte: " + error.message);
  }
}

async function enviarCorreo(htmlContent, remitenteData, attachmentPath = null) {
  if (!remitenteData) {
    throw new Error(
      "No se encontró un remitente configurado en la base de datos."
    );
  }

  console.log("Destinatario:", remitenteData.email);

  const token = await getAccessToken();
  const destinatarioEmail = remitenteData.email;
  const sender = "tecnologia@affi.net";
  const urlMailSend = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;

  const jsonBody = {
    message: {
      subject: "Resumen de Diligencias completadas",
      body: { contentType: "HTML", content: htmlContent },
      toRecipients: [{ emailAddress: { address: destinatarioEmail } }],
    },
    saveToSentItems: false,
  };

  // Solo si hay archivo adjunto
  if (attachmentPath) {
    const fileBuffer = fs.readFileSync(attachmentPath);
    const base64File = fileBuffer.toString("base64");

    jsonBody.message.attachments = [
      {
        "@odata.type": "#microsoft.graph.fileAttachment",
        name: "historico_formularios.xlsx",
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        contentBytes: base64File,
      },
    ];
  }

  return axios.post(urlMailSend, jsonBody, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export default enviarReporteHistoricos;
