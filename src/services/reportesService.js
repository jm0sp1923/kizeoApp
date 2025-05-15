import reportes from "../models/reportes.js";

async function crearReporte(data) {
  try { 
    const reporte = {
        record_id: data.id,
        solicitante: data.fields.asesor_que_solicita_la_visita.result.value.code,
        email_solicitante: data.fields.correo_del_asesor_que_solicit.result.value.text,
        old_direccion: data.fields.direccion_del_inmueble_arrend.result.value.text,
        old_ciudad: data.fields.ciudad_del_inmueble_arrendado.result.value.text,
        new_direccion: data.fields.direccion.result.value,
        new_ciudad: data.fields.ciudad.result.value,
        fecha_solicitud: data.fields.fecha_de_la_solicitud.result.value.date,
        cuenta: data.fields.cuenta.result.value.code,
    };

    
    const result = await reportes.insertOne(reporte);
    //console.log(`✅ Reporte guardado en MongoDB con ID: ${result.id}`);

  } catch (error) {
    throw new Error("Error al crear el reporte: " + error.message);
  }
}

export { crearReporte };
