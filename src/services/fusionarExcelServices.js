import fs from "fs/promises"; // <--- Usamos versión PROMISES
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const scriptPath = path.resolve("src", "utils", "fusionar_excel.py");
const execAsync = promisify(exec);

async function fusionarExcel(files) {
  const { reporteAfianzado, baseCartera } = files;

  if (!reporteAfianzado || !baseCartera) {
    throw new Error("Ambos archivos son requeridos.");
  }

  const archivoDatos = reporteAfianzado[0].path;
  const archivoBusqueda = baseCartera[0].path;
  const processedDir = path.resolve("processed");

  // Crear directorio si no existe
  await fs.mkdir(processedDir, { recursive: true });

  const outputFilePath = path.join(processedDir);
  const command = `python "${scriptPath}" "${archivoBusqueda}" "${archivoDatos}" "${outputFilePath}"`;

  const { stdout } = await execAsync(command);
  console.log(`Resultado del script: ${stdout}`);

  await fs.unlink(archivoDatos);
  await fs.unlink(archivoBusqueda);

  return {
    success: true,
    message: "Archivos procesados exitosamente.",
    downloadUrl: `/excel_fusionado.xlsx`,
  };
}


export default fusionarExcel;
