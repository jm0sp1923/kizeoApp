import axios from "axios";
import "dotenv/config";

const { CLIENT_ID_AD, CLIENT_SECRET_AD, TENANT_ID_AD } = process.env;

// 🔹 Obtener el token de acceso
// Este código obtiene un token de acceso para la API de Microsoft Graph.
const getAccessToken = async () => {
    const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID_AD}/oauth2/v2.0/token`;
  
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", CLIENT_ID_AD);
    params.append("client_secret", CLIENT_SECRET_AD);
    params.append("scope", "https://graph.microsoft.com/.default");
  
    const response = await axios.post(tokenUrl, params);
    return response.data.access_token;
  };

export default getAccessToken;