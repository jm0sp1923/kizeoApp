import mongoose from "mongoose";

const remitenteSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true    
    }
})

export default mongoose.model("Remitente", remitenteSchema);