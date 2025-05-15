import mongoose from "mongoose";

const logSchema = new mongoose.Schema({

  
    data: {
        type: Object,
        required: true
    },
  

});

export default mongoose.model("Logs", logSchema);