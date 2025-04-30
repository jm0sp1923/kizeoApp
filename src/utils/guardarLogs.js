import expressListRoutes from 'express-list-routes';
import { MongoClient } from 'mongodb';
import "dotenv/config";

const uri = process.env.MONGODB_URI; 
const dbName = process.env.MONGODB_DB_NAME; // Nombre de tu base de datos
const collectionName = process.env.MONGODB_COLLECTION_NAME; // Nombre de tu colección

const guardarLog = async (form_name, data) => {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const logEntry = {
      form_name,
      form_id: data.form_id,
      data,
      created_at: new Date()
    };

    const result = await collection.insertOne(logEntry);
    console.log(`✅ Log guardado en MongoDB con ID: ${result.insertedId}`);

    await client.close();
  } catch (error) {
    console.error('❌ Error guardando el log en MongoDB:', error.message);
  }
};


export {guardarLog}