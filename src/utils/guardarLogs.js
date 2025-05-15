import Logs from "../models/logs.js";

const guardarLog = async (data) => {
  try {

    let form_name = data.form_name;
    let form_id = data.form_id;

    const logEntry = {
      data: data,
    };

    const result = await Logs.insertOne(logEntry);
    console.log("✅ Log guardado en MongoDB con");

    return `Log guardado con éxito ${result._id}`;

  } catch (error) {
    throw new Error(`Error guardando el log en MongoDB: ${error.message}`);
  }
};


export {guardarLog}