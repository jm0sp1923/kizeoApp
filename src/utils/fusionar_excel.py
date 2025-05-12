import pandas as pd
import sys
import os

# Constantes de columnas
NUMERO_CUENTA = 'Numero Cuenta'
CUENTA = 'Cuenta'

def fusionar_excel(archivo_datos, archivo_busqueda):
    # Leer archivo_datos y archivo_busqueda forzando las columnas como texto
    archivo_datos = pd.read_excel(archivo_datos, engine='openpyxl', dtype={NUMERO_CUENTA: str})
    archivo_busqueda = pd.read_excel(archivo_busqueda, engine='openpyxl', dtype={CUENTA: str})

    # Limpiar nombres de columnas
    archivo_datos.columns = archivo_datos.columns.str.strip()
    archivo_busqueda.columns = archivo_busqueda.columns.str.strip()

    # Asegurar que las columnas estén limpias
    archivo_datos[NUMERO_CUENTA] = archivo_datos[NUMERO_CUENTA].astype(str).str.strip()
    archivo_busqueda[CUENTA] = archivo_busqueda[CUENTA].astype(str).str.strip()

    # Realizar la unión por cuenta
    archivo_unido = pd.merge(
        archivo_datos,
        archivo_busqueda,
        left_on=NUMERO_CUENTA,
        right_on=CUENTA,
        how='inner',
        validate='many_to_many'
    )

    # Renombrar columnas
    archivo_unido = archivo_unido.rename(columns={
        'Identificacion Tercero': 'Identificacion',
        'Nombres / Siglas': 'Nombres',
        'Ciudad_y': 'Ciudad'
    })

    # Columnas finales requeridas
    columnas_salida = [
        'Inmobiliaria',
        'Nit Inmobliaria',
        'Cuenta',
        'Identificacion',
        'Nombres',
        'Apellidos / Razon Social',
        'Tipo Amparo',
        'Cobertura',
        'Direccion',
        'Ciudad',
        'Estado',
        'Estado Cobro'
    ]

    # Crear carpeta 'processed'
    processed_folder = os.path.join(os.getcwd(), 'processed')
    os.makedirs(processed_folder, exist_ok=True)

    # Guardar resultado
    output_path = os.path.join(processed_folder, 'excel_fusionado.xlsx')
    archivo_unido[columnas_salida].to_excel(output_path, index=False)

    print(f"\nArchivo procesado creado en: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python fusionar_excel.py archivo_datos.xlsx archivo_busqueda.xlsx")
    else:
        archivo_datos = sys.argv[1]
        archivo_busqueda = sys.argv[2]
        fusionar_excel(archivo_datos, archivo_busqueda)
