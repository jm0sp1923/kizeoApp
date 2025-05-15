import Logs from "../models/logs.js";

const guardarLog = async (form_name, data) => {
  try {
   
    const logEntry = {
      form_name,
      form_id: data.form_id,
      data,
      created_at: new Date()
    };

    const result = await Logs.insertOne(logEntry);
    console.log(`✅ Log guardado en MongoDB con ID: ${result.insertedId}`);

  } catch (error) {
    console.error('❌ Error guardando el log en MongoDB:', error.message);
  }
};


export {guardarLog}