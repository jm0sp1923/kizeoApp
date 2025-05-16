import getAccessToken from "../config/tokenTenant.js";
import axios from "axios";
import fs from "fs";
import reportes from "../models/reportes.js";
import generarExcelReportes from "../utils/crearExcelReportes.js";
import emailReporte from "../template/emailReportesTemplate.js";

async function generarReporte() {
  try {
    const hoy = new Date();
    const fechasValidas = [];
    let diasRetroceso = 1;

    while (fechasValidas.length < 6) {
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

    console.log("Buscando reportes desde:", desdeFecha.toISOString());
    console.log("Hasta:", hastaFecha.toISOString());

    // Buscar reportes en ese rango de fechas
    const reportes_errores = await reportes.find({
      fecha_solicitud: {
        $gte: desdeFecha,
        $lte: hastaFecha,
      },
    });

    console.log("Reportes encontrados:", reportes_errores);

    if (reportes_errores.length === 0) {
      console.log("No hay reportes para enviar.");
      return;
    }

    const fecha = new Date().toLocaleDateString();
    const htmlContent = emailReporte(fecha);
    const archivoExcel = generarExcelReportes(reportes_errores);
 

    await enviarCorreo(htmlContent, archivoExcel);

    console.log("Correo con reporte enviado exitosamente.");
    return "Correo con reporte enviado exitosamente.";
  } catch (error) {
    throw new Error("Error al crear el reporte: " + error.message);
  }
}

async function enviarCorreo(htmlContent, attachmentPath) {
  
  const token = await getAccessToken();
  const destinatarioEmail = "operaciones@affi.net";
  const sender = "comercial@affi.net";
  const urlMailSend = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;

  // Leer archivo y convertir a base64
  const fileBuffer = fs.readFileSync(attachmentPath);
  const base64File = fileBuffer.toString("base64");

  const jsonBody = {
    message: {
      subject: "Resumen de Cambios de Dirección",
      body: { contentType: "HTML", content: htmlContent },
      toRecipients: [{ emailAddress: { address: destinatarioEmail } }],
      attachments: [
        {
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: "reporte_direcciones.xlsx",
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          contentBytes: base64File,
        },
      ],
    },
    saveToSentItems: false,
  };

  return axios.post(urlMailSend, jsonBody, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export default generarReporte;
