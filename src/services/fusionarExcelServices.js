import fs from "fs/promises";
import path from "path";
import fusionarExcelScript from "../utils/fusionar_excel.js";

async function fusionarExcel(files) {
  const { reporteAfianzado, baseCartera } = files;

  if (!reporteAfianzado || !baseCartera) {
    throw new Error("Ambos archivos son requeridos.");
  }

  const archivoBusqueda = reporteAfianzado[0].path;
  const  archivoDatos = baseCartera[0].path;
  const processedDir = path.resolve("processed");

  await fs.mkdir(processedDir, { recursive: true });

  const process = await fusionarExcelScript(archivoDatos, archivoBusqueda);

  return process;
}

export default fusionarExcel;
