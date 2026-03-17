import getAccessToken from "../../config/tokenTenant.js";
import axios from "axios";
import fs from "fs";
import historico from "../../models/historico.js";
import { generarExcelHistorico } from "../../utils/crearExcelReportes.js";
import emailHistorico from '../../template/emailReporteHistorico.js';
import remitentes from "../../models/remitentes.js";

function formatDateTime(fecha, h, m, s) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  const hh = String(h).padStart(2, "0");
  const mi = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function formatFechaSimple(fecha) {
  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function obtenerDiaAnteriorNoDomingo(fecha) {
  let diaAnterior = new Date(fecha);
  do {
    diaAnterior.setDate(diaAnterior.getDate() - 1);
  } while (diaAnterior.getDay() === 0);
  return diaAnterior;
}

function obtenerRangoReporte() {
  // Fecha actual en zona horaria Colombia
  const ahoraStr = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
  const ahora = new Date(ahoraStr);
  const horaActual = ahora.getHours();

  let filtro, etiqueta;

  if (horaActual >= 2 && horaActual < 10) {
    // Turno 3:00 AM → día anterior completo (saltando domingo)
    const ayerNoDomingo = obtenerDiaAnteriorNoDomingo(ahora);
    const fechaRegex = "^" + formatFechaSimple(ayerNoDomingo);
    etiqueta = ayerNoDomingo.toLocaleDateString("es-CO");
    filtro = { "data._update_time": { $regex: fechaRegex } };
  } else if (horaActual >= 10 && horaActual < 15) {
    // Turno 11:00 AM → desde 3:00 AM hasta 11:00 AM hoy
    const inicio = formatDateTime(ahora, 3, 0, 0);
    const fin = formatDateTime(ahora, 11, 0, 0);
    etiqueta = `${inicio} - ${fin}`;
    filtro = { "data._update_time": { $gte: inicio, $lt: fin } };
  } else {
    // Turno 4:00 PM → desde 3:00 AM hasta 4:00 PM hoy (acumulado del día)
    const inicio = formatDateTime(ahora, 3, 0, 0);
    const fin = formatDateTime(ahora, 16, 0, 0);
    etiqueta = `${inicio} - ${fin}`;
    filtro = { "data._update_time": { $gte: inicio, $lt: fin } };
  }

  return { filtro, etiqueta };
}

async function enviarReporteHistoricos() {
  try {

    console.log("Iniciando proceso para enviar reporte histórico...");

    const { filtro, etiqueta } = obtenerRangoReporte();
    console.log(`   Rango del reporte: ${etiqueta}`);

    // Buscar reportes en el rango con _direction "received"
    const historicoReportes = await historico.find({
      ...filtro,
      "data._direction": "received",
    });

    const fechaFormateada = etiqueta;

    const htmlContent = emailHistorico(fechaFormateada);
    const archivoExcel = generarExcelHistorico(historicoReportes);

    const remitenteData = await remitentes.findOne({
      area: "RCI",
    });

    console.log("Remitente encontrado:", remitenteData);  

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

  try {
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

    console.log("📧 Enviando correo a:", destinatarioEmail);
    const response = await axios.post(urlMailSend, jsonBody, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("✅ Correo enviado exitosamente");
    return response;
  } catch (emailError) {
    console.error("❌ Error enviando correo:", emailError.response?.status, emailError.response?.data || emailError.message);
    throw emailError;
  }
}

export default enviarReporteHistoricos;
