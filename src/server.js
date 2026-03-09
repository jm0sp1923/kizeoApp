import app from "./app.js";
import routes from "./routes/index.js";
import expressListRoutes from "express-list-routes";

// Importamos la función que conecta a la base de datos MongoDB
import connectDB from "./db.js";

//Importar el scheduler de reportes
import iniciarScheduler from "./scheduler/reporteHistoricoScheduler.js";


const PORT = process.env.PORT || 3000;

// Función async para esperar la conexión
(async () => {
  // Esperamos a que MongoDB se conecte
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log("📌 API Routes:");

    expressListRoutes(app,{ prefix: "" });

    expressListRoutes(routes,{ prefix: "/api" });

    // Iniciar el scheduler después de que MongoDB esté listo
    iniciarScheduler();
  });
})();