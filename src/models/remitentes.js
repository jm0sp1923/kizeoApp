import mongoose from "mongoose";

const remitenteSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true    
    },
    area:{
        type: String,
        required: true,
        enum: ["Comercial", "Administración", "OPERACIONES", "RCI"]
    }

})

export default mongoose.model("Remitente", remitenteSchema);