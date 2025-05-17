import fs from "fs/promises";
import path from "path";
import xlsx from "xlsx";

const NUMERO_CUENTA = "Numero Cuenta";
const CUENTA = "Cuenta";

async function fusionarExcel(archivoDatos, archivoBusqueda) {
  try {
    // 1. Leer archivo Excel de datos
    const archivoDatosParsed = xlsx.readFile(archivoDatos);
    const sheetDatos =
      archivoDatosParsed.Sheets[archivoDatosParsed.SheetNames[0]];
    const datosParsed = xlsx.utils.sheet_to_json(sheetDatos);

    // 2. Leer archivo Excel de búsqueda
    const archivoBusquedaParsed = xlsx.readFile(archivoBusqueda);
    const sheetBusqueda =
      archivoBusquedaParsed.Sheets[archivoBusquedaParsed.SheetNames[0]];
    const archivoBusquedaData = xlsx.utils.sheet_to_json(sheetBusqueda);

    // 3. Limpiar campos clave (cuentas)
    const cuentasBusquedaSet = new Set(
      archivoBusquedaData
        .map((row) => row[CUENTA]?.toString().trim())
        .filter(Boolean)
    );

    const cuentasDatosSet = new Set(
      datosParsed
        .map((row) => row[NUMERO_CUENTA]?.toString().trim())
        .filter(Boolean)
    );

    // 4. Filtrar cuentas coincidentes
    const busquedaMap = new Map(
      archivoBusquedaData.map((row) => [row[CUENTA]?.toString().trim(), row])
    );

    const datosFusionados = datosParsed
      .filter((row) => busquedaMap.has(row[NUMERO_CUENTA]?.toString().trim())) // solo si hay coincidencia
      .map((row) => {
        const cuenta = row[NUMERO_CUENTA]?.toString().trim();
        const datosBusqueda = busquedaMap.get(cuenta);

        // Fusionar ambos objetos (datos + búsqueda)
        return {
          ...row, // datos originales
          ...datosBusqueda, // datos de búsqueda (sobrescriben si hay campos iguales)
        };
      });

    // Después de crear datosFusionados
    const columnasDeseadas = [
      "Inmobiliaria",
      "Nit Inmobliaria",
      "Cuenta",
      "Identificacion Tercero",
      "Nombres / Siglas",
      "Apellidos / Razon Social",
      "Tipo Amparo",
      "Cobertura",
      "Direccion",
      "Ciudad",
      "Estado",
      "Estado Cobro",
    ];

    // Filtrar las columnas deseadas
    const datosFiltrados = datosFusionados.map((row) => {
      const obj = {};
      columnasDeseadas.forEach((col) => {
        obj[col] = row[col] ?? "";
      });
      return obj;
    });


    // 5. Crear carpeta 'processed'
    const processedFolder = path.join(process.cwd(), "processed");
    await fs.mkdir(processedFolder, { recursive: true });

    // 6. Guardar resultado en Excel
    const outputPath = path.join(processedFolder, "excel_fusionado.xlsx");
    const worksheet = xlsx.utils.json_to_sheet(datosFiltrados);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Fusionado");

    await xlsx.writeFile(workbook, outputPath);

    console.log(`✅ Archivo creado con cuentas coincidentes: ${outputPath}`);

    return {
      success: true,
      message: "Cuentas coincidentes extraídas correctamente.",
      downloadUrl: "/excel_fusionado.xlsx",
    };
  } catch (error) {
    console.error("❌ Error al procesar los archivos:", error);
    throw new Error("Ocurrió un error al procesar los archivos");
  }
}

export default fusionarExcel;
