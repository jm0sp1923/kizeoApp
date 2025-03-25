# Usar una imagen base con Node.js (para Express) y Python (para ejecutar archivos .py)
FROM node:18-slim

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar el resto de los archivos del proyecto al contenedor
COPY . .

# Instalar las dependencias de Node.js
RUN npm install


# Exponer el puerto en el que el servidor Express escuchará
EXPOSE 3000

# Comando por defecto para ejecutar tu servidor Express
CMD ["npm", "start"]
