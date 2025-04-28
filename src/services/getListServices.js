import "dotenv/config";

const token = process.env.KIZEO_API_KEY;
async function getListServices() {
    try {
        const response = await fetch('https://www.kizeoforms.com/rest/v3/lists/', {
          method: 'GET',
          headers: {
            Authorization: token,
          }
        });
    
        if (!response.ok) {
          throw new Error('Error al obtener los datos de la API');
        }
    
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error en la API externa:', error);
        res.status(500).json({ error: error.message });
      }
  };
  

  export default getListServices;