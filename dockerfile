# Usar una imagen base con Node.js (para Express) y Python (para ejecutar archivos .py)
FROM node:18-slim

# Actualizar y agregar dependencias necesarias (Python, pip y venv)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el archivo requirements.txt para instalar dependencias de Python
COPY requirements.txt /app/

# Crear un entorno virtual para Python y instalar las dependencias
RUN python3 -m venv /app/venv \
    && /app/venv/bin/pip install --no-cache-dir -r /app/requirements.txt

# Copiar el resto de los archivos del proyecto al contenedor
COPY . .

# Instalar las dependencias de Node.js
RUN npm install

# Configurar el PATH para que el contenedor use el entorno virtual de Python
ENV PATH="/app/venv/bin:$PATH"

# Exponer el puerto en el que el servidor Express escuchará
EXPOSE 3000

# Comando por defecto para ejecutar tu servidor Express
CMD ["npm", "start"]