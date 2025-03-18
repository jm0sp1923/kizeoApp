import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Rutas
app.use("/api",routes);

app.get("/", (req, res) => {
  res.status(200).send("Hello world");
});

// Ruta de health check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware para manejar errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Ocurrió un error interno en el servidor" });
});

export default app; // Exportamos sin iniciar el servidor
