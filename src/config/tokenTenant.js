import axios from "axios";
import "dotenv/config";

const { CLIENT_ID_AD, CLIENT_SECRET_AD, TENANT_ID_AD } = process.env;

// 🔹 Obtener el token de acceso
// Este código obtiene un token de acceso para la API de Microsoft Graph.
const getAccessToken = async () => {
    try {
        console.log("Obteniendo token de acceso para la API de Microsoft Graph...");
        // Verifica que las variables de entorno necesarias estén definidas
        console.log("Variables de entorno:", {
            CLIENT_ID_AD,
            CLIENT_SECRET_AD,
            TENANT_ID_AD
        });

        if (!CLIENT_ID_AD || !CLIENT_SECRET_AD || !TENANT_ID_AD) {
            throw new Error("Faltan las variables de entorno CLIENT_ID_AD, CLIENT_SECRET_AD o TENANT_ID_AD");
        }
        const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID_AD}/oauth2/v2.0/token`;
      
        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");
        params.append("client_id", CLIENT_ID_AD);
        params.append("client_secret", CLIENT_SECRET_AD);
        params.append("scope", "https://graph.microsoft.com/.default");
      
        const response = await axios.post(tokenUrl, params);
        console.log("✅ Token obtenido exitosamente");
        return response.data.access_token;
    } catch (error) {
        console.error("❌ Error obteniendo token:", error.response?.status, error.response?.data);
        throw error;
    }
}

export default getAccessToken;