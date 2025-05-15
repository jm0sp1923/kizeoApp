import fs from 'fs/promises';
import path from 'path';
import xlsx from 'xlsx';
import Papa from 'papaparse';

const NUMERO_CUENTA = 'Numero Cuenta';
const CUENTA = 'Cuenta';

async function fusionarExcel(archivoDatos, archivoBusqueda) {
  try {
    // 1. Leer archivo CSV
    const datosCsv = await fs.readFile(archivoDatos, 'utf-8');
    let archivoDatosParsed = Papa.parse(datosCsv, { header: true, delimiter: ';' }).data;

    // 1.1 Limpiar las llaves (cabeceras) del archivo CSV
    archivoDatosParsed = archivoDatosParsed.map(row => {
      const cleanedRow = {};
      for (const key in row) {
        const cleanKey = key.trim(); // Quita espacios en los encabezados
        cleanedRow[cleanKey] = row[key];
      }
      return cleanedRow;
    });

    // 2. Leer archivo Excel
    const archivoBusquedaParsed = xlsx.readFile(archivoBusqueda);
    const sheet = archivoBusquedaParsed.Sheets[archivoBusquedaParsed.SheetNames[0]];
    const archivoBusquedaData = xlsx.utils.sheet_to_json(sheet);

    // 3. Limpiar columnas (cuentas)
    archivoDatosParsed.forEach((row) => {
      if (row[NUMERO_CUENTA]) {
        row[NUMERO_CUENTA] = row[NUMERO_CUENTA].toString().trim().replace('.0', '');
      }
    });

    archivoBusquedaData.forEach((row) => {
      if (row[CUENTA]) {
        row[CUENTA] = row[CUENTA].toString().trim();
      }
    });

    // 4. Crear mapa de dirección
    const mapaDireccionAfianzados = new Map();
    archivoBusquedaData.forEach((row) => {
      if (row[CUENTA] && row['Direccion']) {
        mapaDireccionAfianzados.set(row[CUENTA], row['Direccion']);
      }
    });

    // 5. Fusionar datos
    const archivoUnido = archivoDatosParsed.map((dato) => {
      if (mapaDireccionAfianzados.has(dato[NUMERO_CUENTA])) {
        return {
          ...dato,
          'Direccion': mapaDireccionAfianzados.get(dato[NUMERO_CUENTA])
        };
      } else {
        return dato;
      }
    });

    // 6. Filtrar registros que tengan dirección
    const archivoFiltrado = archivoUnido.filter((row) => row['Direccion']);

    // 7. Seleccionar columnas con los nombres exactos
    const archivoUnidoSeleccionado = archivoFiltrado.map((row) => ({
      'Inmobiliaria': row['Inmobiliaria'] || '',
      'Nit Inmobiliaria': row['Nit Inmobiliaria'] || '',  // <- corregí la falta de 'i'
      'Cuenta': row['Cuenta'] || '',
      'Identificacion Tercero': row['Identificacion Tercero'] || '',
      'Nombres / Siglas': row['Nombres / Siglas'] || '',
      'Apellidos / Razon Social': row['Apellidos / Razon Social'] || '',
      'Tipo Amparo': row['Tipo Amparo'] || '',
      'Cobertura': row['Cobertura'] || '',
      'Direccion': row['Direccion'] || '',
      'Ciudad_y': row['Ciudad_y'] || '',
      'Estado': row['Estado'] || '',
      'ETAPA DE COBRO ACTUAL': row['ETAPA DE COBRO ACTUAL'] || ''
    }));

    // 8. Crear carpeta 'processed'
    const processedFolder = path.join(process.cwd(), 'processed');
    await fs.mkdir(processedFolder, { recursive: true });

    // 9. Guardar Excel
    const outputPath = path.join(processedFolder, 'excel_fusionado.xlsx');
    const finalWorksheet = xlsx.utils.json_to_sheet(archivoUnidoSeleccionado);
    const finalWorkbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(finalWorkbook, finalWorksheet, 'Fusionado');

    await xlsx.writeFile(finalWorkbook, outputPath);

    console.log(`✅ Archivo procesado creado en: ${outputPath}`);

    return {
      success: true,
      message: 'Archivos procesados exitosamente.',
      downloadUrl: '/excel_fusionado.xlsx'
    };

  } catch (error) {
    console.error('❌ Error al procesar los archivos:', error);
    throw new Error('Ocurrió un error al procesar los archivos');
  }
}

export default fusionarExcel;
