// Importamos mongoose para poder interactuar con MongoDB
import mongoose from "mongoose";

// Importamos la configuración de las variables de entorno, como el URI de la base de datos
import "dotenv/config";

// Función asíncrona que se encarga de conectar a la base de datos MongoDB
const connectDB = async () => {
    try {
        // La URI de conexión ya incluye el nombre de la base de datos
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error("Falta la variable de entorno MONGODB_URI");
        }

        // Log sin exponer las credenciales (usuario:contraseña)
        const safeURI = mongoURI.replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@");
        console.log(`📡 Conectando a MongoDB: ${safeURI}`);

        // Intentamos establecer la conexión con la base de datos utilizando el URI almacenado en las variables de entorno
        await mongoose.connect(mongoURI);

        // Si la conexión es exitosa, se muestra un mensaje en consola
        console.log("✅ Conectado a la base de datos MongoDB");
    } catch (error) {
        // Si ocurre un error en la conexión, lo capturamos y mostramos un mensaje de error en consola
        console.log("Error al conectar a la base de datos:", error.message);     
    }
}

// Exportamos la función connectDB para que pueda ser utilizada en otros archivos
export default connectDB;
