import reportes from "../models/reportes.js";

async function crearReporte(data) {
  try {
    const cuenta = data.fields.cuenta.result.value.code;

    const reporte = {
      record_id: data.id,
      solicitante: data.fields.asesor_que_solicita_la_visita.result.value.code,
      email_solicitante: data.fields.correo_del_asesor_que_solicit.result.value.text,
      old_direccion: data.fields.direccion_del_inmueble_arrend.result.value.text,
      old_ciudad: data.fields.ciudad_del_inmueble_arrendado.result.value.text,
      new_direccion: data.fields.direccion_a_corregir.result.value,
      new_ciudad: data.fields.ciudad_a_corregir.result.value,
      fecha_solicitud: data.fields.fecha_de_la_solicitud.result.value.date,
      tipo_solicitud: data.fields.tipo_de_diligencia?.result?.value?.code.trim(),
      cuenta: cuenta,
    };

    const result = await reportes.updateOne(
      { cuenta: cuenta },
      { $set: reporte },
      { upsert: true }
    );

    if (result.upsertedCount > 0) {
      return `✅ Reporte creado con cuenta: ${cuenta}`;
    } else if (result.modifiedCount > 0) {
      return `✅ Reporte actualizado con cuenta: ${cuenta}`;
    } else {
      return `⚠️ No se modificó nada para la cuenta: ${cuenta}`;
    }

  } catch (error) {
    throw new Error("❌ Error al crear o actualizar el reporte: " + error.message);
  }
}

export { crearReporte };
