import XLSX from "xlsx";
import path from "path";
import cleanText from "./limpiarTexto.js";

const __dirname = path.resolve();

export default async function changeExcelToJson(file) {
  if (!file) {
    return null;
  }

  console.log("Archivo Excel recibido en funcion changeExcelToJson:", file);

  if (!file.mimetype.includes("spreadsheet")) {
    return null; // El archivo no es válido
  }

  // Leer el archivo Excel
  const workbook = XLSX.readFile(file.path);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Convertir las celdas a JSON
  const jsonDataFromExcel = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Eliminar la primera fila (cabecera) y limpiar solo la columna 9
  const dataWithoutHeader = jsonDataFromExcel.slice(1);

  const formattedData = dataWithoutHeader.map((row) => {
    const reorganizedRow = [...row]; // Crear una copia del arreglo original
    reorganizedRow[0] = row[2]; // Asignar el valor de la columna 2 (índice 2) al índice 0
    reorganizedRow[2] = row[0]; // Mover el valor de la columna 0 (índice 0) al índice 2

    // Limpiar solo la columna 9 (índice 8)
    reorganizedRow[8] = cleanText(reorganizedRow[8] || "");

    // Unir las columnas con un separador '|'
    return reorganizedRow.join("|");
  });

  const jsonBody = { items: formattedData };
  console.log("Datos procesados del Excel:", jsonBody);

  return jsonBody; // Devolver el objeto JSON con los datos procesados
}
