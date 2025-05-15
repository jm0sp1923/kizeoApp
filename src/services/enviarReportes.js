import getAccessToken from "../config/tokenTenant.js";
import axios from "axios";
import fs from "fs";
import reportes from "../models/reportes.js";
import generarExcelReportes from "../utils/crearExcelReportes.js";
import emailReporte from "../template/emailReportesTemplate.js";

async function generarReporte() {
    try {
      const reportes_errores = await reportes.find();
      
      if (reportes_errores.length === 0) {
        console.log("No hay reportes para enviar.");
        return;
      }
  
      const fecha = new Date().toLocaleDateString();
      const htmlContent = emailReporte(fecha);

  
      const archivoExcel = generarExcelReportes(reportes_errores);
      const destinatarioEmail = "juan.munoz@affi.net";
  
      await enviarCorreo(destinatarioEmail, htmlContent, archivoExcel);
  
      return "Correo con reporte enviado exitosamente.";
    } catch (error) {
      throw new Error("Error al crear el reporte: " + error.message);
    }
  }
  

  

  async function enviarCorreo(destinatarioEmail, htmlContent, attachmentPath) {
    const token = await getAccessToken();
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
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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