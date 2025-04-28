import axios from "axios";
import "dotenv/config";

const { CLIENT_ID, CLIENT_SECRET, TENANT_ID } = process.env;

// 🔹 Obtener el token de acceso
// Este código obtiene un token de acceso para la API de Microsoft Graph.
const getAccessToken = async () => {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("scope", "https://graph.microsoft.com/.default");
  
    const response = await axios.post(tokenUrl, params);
    return response.data.access_token;
  };

export default getAccessToken;