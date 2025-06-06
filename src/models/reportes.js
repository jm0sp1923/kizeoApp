import mongoose from "mongoose";

const reportes = new mongoose.Schema({

    record_id: {
        type: String,
        required: true,
        unique: true
    },
    solicitante: {
        type: String,
        required: true
    },
    email_solicitante: {
        type: String,
        required: true
    },
    old_direccion: {
        type: String,
        required: true
    },
    old_ciudad: {
        type: String,
        required: true
    },
    new_direccion: {
        type: String,
        required: true
    },
    new_ciudad: {
        type: String,
        required: true
    },
    fecha_solicitud: {
        type: Date,
        required: true,
    },
    tipo_solicitud: {
        type: String,
    },

    cuenta: {
        type: String,
        required: true,
        unique: true
    },

});

export default mongoose.model("reportes_error_datos", reportes);