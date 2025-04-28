import pandas as pd
import sys
import os

# Definir la constante
NUMERO_CUENTA = 'Numero Cuenta'
CUENTA = 'Cuenta'

def fucionar_excel(archivo_datos, archivo_busqueda):
    # Leer el archivo de datos
    archivo_datos = pd.read_csv(
        archivo_datos,
        encoding='ISO-8859-1',
        delimiter=';',
        on_bad_lines='skip',
        engine='python'
    )  # Saltar las líneas con errores

    # Leer el archivo de búsqueda
    archivo_busqueda = pd.read_excel(archivo_busqueda, engine='openpyxl')

    # Limpiar los nombres de las columnas
    archivo_datos.columns = archivo_datos.columns.str.strip()
    archivo_busqueda.columns = archivo_busqueda.columns.str.strip()

    # Asegurarse de que las columnas 'Numero Cuenta' y 'Cuenta' sean de tipo str y estén limpias
    archivo_datos[NUMERO_CUENTA] = archivo_datos[NUMERO_CUENTA].astype(str).str.strip()
    archivo_busqueda[CUENTA] = archivo_busqueda[CUENTA].astype(str).str.strip()

    # Eliminar cualquier '.0' en los números de cuenta
    archivo_datos[NUMERO_CUENTA] = archivo_datos[NUMERO_CUENTA].str.replace('.0', '', regex=False)

    # Unir los dos archivos por las columnas correspondientes
    archivo_unido = pd.merge(archivo_datos, archivo_busqueda, left_on=NUMERO_CUENTA, right_on=CUENTA, how='inner', validate='many_to_many')

    # Seleccionar las columnas necesarias
    archivo_unido_seleccionado = archivo_unido[['Inmobiliaria','Nit Inmobliaria','Cuenta','Identificacion Tercero',
                                               'Nombres / Siglas', 'Apellidos / Razon Social', 'Tipo Amparo', 'Cobertura',
                                              'Direccion', 'Ciudad_y', 'Estado', 'ETAPA DE COBRO ACTUAL']]

    # Usar el directorio actual del proyecto (raíz del proyecto)
    project_folder = os.getcwd()  # Obtiene el directorio de trabajo actual (raíz del proyecto)
    processed_folder = os.path.join(project_folder, 'processed')  # Ruta completa a la carpeta 'processed'

    if not os.path.exists(processed_folder):
        os.makedirs(processed_folder)
        print(f"Carpeta 'processed' creada en: {processed_folder}")
    else:
        print(f"La carpeta 'processed' ya existe en: {processed_folder}")

    # Guardar el archivo procesado en la carpeta 'processed'
    output_path = os.path.join(processed_folder, 'excel_fusionado.xlsx')
    archivo_unido_seleccionado.to_excel(output_path, index=False)

    # Confirmar que el archivo se ha guardado correctamente
    print(f"Archivo procesado creado en: {output_path}")

if __name__ == "__main__":
    archivo_datos = sys.argv[1]
    archivo_busqueda = sys.argv[2]

    fucionar_excel(archivo_datos, archivo_busqueda)
