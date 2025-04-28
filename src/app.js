import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import routesViews from "./routes/views/views.routes.js"; 
import path from "path";
import { fileURLToPath } from 'url'; 

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());


const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename);        


// Motor de plantillas, ejemplo EJS:
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Para servir archivos estáticos (css, img, js)
app.use(express.static(path.join(__dirname,'..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'processed')));


// Rutas
app.use("/api",routes);
app.use(routesViews); 


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

export default app; 
