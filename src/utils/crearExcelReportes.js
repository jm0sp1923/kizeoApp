import * as XLSX from "xlsx";
import path from "path";
import os from "os"; 

function generarExcelReportes(lista_reportes) {
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

/**
 * Calcula la diferencia entre dos fechas y la devuelve en formato HH:mm:ss
 * @param {string} inicio - Fecha/hora de inicio (ej: _create_time)
 * @param {string} fin - Fecha/hora de fin (ej: _update_time)
 * @returns {string} Duración en formato HH:mm:ss o "N/A" si no se puede calcular
 */
function calcularTiempoDiligenciamiento(inicio, fin) {
  try {
    if (!inicio || !fin) return "N/A";

    const fechaInicio = new Date(inicio);
    const fechaFin = new Date(fin);

    // Validar que las fechas sean válidas
    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) return "N/A";

    const diffMs = fechaFin.getTime() - fechaInicio.getTime();

    // Si la diferencia es negativa o cero, retornar N/A
    if (diffMs <= 0) return "N/A";

    const totalSec = Math.floor(diffMs / 1000);
    const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
    const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");

    return `${hh}:${mm}:${ss}`;
  } catch {
    return "N/A";
  }
}

function generarExcelHistorico(lista_reportes) {
  try {
    const data = lista_reportes.map((r) => ({
      id_historico: r.data.external_id,
      _cuenta: r.data.cuenta,
      _form_id: r.data._form_id,
      _create_time: r.data._create_time,
      _update_time: r.data._update_time,
      tiempo_diligenciamiento: calcularTiempoDiligenciamiento(
        r.data._create_time,
        r.data._update_time
      ),
      _history: r.data._history,
      _user_name: r.data._user_name,
      tipo_de_diligencia: r.data.tipo_de_diligencia,
      acta_de_diligencia: r.data.acta_de_diligencia,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historico");

    const filePath = path.join(os.tmpdir(), "historico_reportes.xlsx");
    XLSX.writeFile(workbook, filePath);
    return filePath;
  } catch (error) {
    console.error("Error al generar el Excel del histórico:", error);
    throw error;
  }
}

export { generarExcelReportes, generarExcelHistorico };