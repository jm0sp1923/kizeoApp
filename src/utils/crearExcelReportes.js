import * as XLSX from "xlsx";
import fs, { Dir } from "fs";
import path from "path";
import os from "os"; // Agregado

function generarExcelReportes(lista_reportes) {

  console.log("Lista de reportes:", lista_reportes);

  function formatFecha(fecha) {
    const d = new Date(fecha);
    const dia = String(d.getUTCDate()).padStart(2, "0");
    const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
    const año = d.getUTCFullYear();
    return `${dia}/${mes}/${año}`;
  }

  const data = lista_reportes.map((r) => ({
    historico_id: r.record_id,
    Solicitante: r.solicitante,
    Email: r.email_solicitante,
    Cuenta: r.cuenta,
    Fecha: formatFecha(r.fecha_solicitud),
    Direccion_anterior: r.old_direccion,
    Ciudad_Anterior: r.old_ciudad,
    Direccion_nueva: r.new_direccion,
    Ciudad_Nueva: r.new_ciudad,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "CambiosDireccion");

  const filePath = path.join(os.tmpdir(), "reporte_direcciones.xlsx"); // Ruta dinámica
  XLSX.writeFile(workbook, filePath);

  return filePath;
}

export default generarExcelReportes;