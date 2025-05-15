import app from "./app.js";
import routes from "./routes/index.js";
import expressListRoutes from "express-list-routes";

// Importamos la función que conecta a la base de datos MongoDB
import connectDB from "./db.js";


const PORT = process.env.PORT || 3000;


// Conectamos a la base de datos MongoDB utilizando la función importada
connectDB(); // Conectar a la base de datos MongoDB

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log("📌 API Routes:");

  expressListRoutes(app,{ prefix: "" });

  expressListRoutes(routes,{ prefix: "/api" });
});
