import mongoose from "mongoose";

const logSchema = new mongoose.Schema({

    form_name: {
        type: String,
        required: true
    },
    form_id: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    create_at: {
        type: Date,
        default: Date.now
    }

});

export default mongoose.model("Logs", logSchema);