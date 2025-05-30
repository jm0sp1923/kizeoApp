import getAccessToken from "../config/tokenTenant.js";
import axios from "axios";
import fs from "fs";
import reportes from "../models/reportes.js";
import { generarExcelReportes } from "../utils/crearExcelReportes.js";
import emailReporte from "../template/emailReportesTemplate.js";
import emailSinReportes from "../template/emailSinReportesTemplate.js";
import remitentes from "../models/remitentes.js";

async function generarReporte() {
  try {
    const hoy = new Date();
    const fechasValidas = [];
    let diasRetroceso = 1;

    while (fechasValidas.length < 1) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - diasRetroceso);

      // Excluir domingos (getDay() === 0)
      if (fecha.getDay() !== 0) {
        fechasValidas.push(fecha);
      }

      diasRetroceso++;
    }

    // Obtener los extremos del rango (inicio y fin del día en UTC)
    const desdeFecha = new Date(fechasValidas[fechasValidas.length - 1]);
    desdeFecha.setUTCHours(0, 0, 0, 0);

    const hastaFecha = new Date(fechasValidas[0]);
    hastaFecha.setUTCHours(23, 59, 59, 999);

    // Buscar reportes en ese rango de fechas
    const reportes_errores = await reportes.find({
      fecha_solicitud: {
        $gte: desdeFecha,
        $lte: hastaFecha,
      },
    });

    const ayer = new Date(hoy); // copia la fecha actual
    ayer.setDate(hoy.getDate() - 1);

    const fechaFormateada = ayer.toLocaleDateString(); // si quieres el string formateado

    const remitenteData = await remitentes.findOne({
      area: "OPERACIONES",
    });

    if (reportes_errores.length === 0) {
      const htmlSinReporte = emailSinReportes(fechaFormateada, remitenteData);

      await enviarCorreo(htmlSinReporte, remitenteData); // Sin adjunto
      console.log("Correo de reporte vacío enviado exitosamente.");
      return "Correo de reporte vacío enviado exitosamente.";
    }

    const htmlContent = emailReporte(fechaFormateada);
    const archivoExcel = generarExcelReportes(reportes_errores);

    await enviarCorreo(htmlContent, remitenteData, archivoExcel);

    console.log(`Correo con reporte enviado exitosamente.`);
    return `Correo con reporte enviado exitosamente. Con ${reportes_errores.length} reportes.`;
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
    console.log("Enviando correo...");

    console.log("Destinatario:", remitenteData.email);

    const token = await getAccessToken();

    console.log("Token obtenido:", token);
    
    const destinatarioEmail = remitenteData.email;
    const sender = "comercial@affi.net";
    const urlMailSend = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;

    const jsonBody = {
      message: {
        subject: "Resumen de Cambios de Dirección",
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
          name: "reporte_direcciones.xlsx",
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
  } catch (error) {
    throw new Error("Error en el evio del correo: " + error.message);
  }
}

export default generarReporte;
