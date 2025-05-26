
import mongoose from "mongoose";

const historicoSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
  },
  "data.external_id": {
    type: String,
    index: true,
  },
});

export default mongoose.model("historico", historicoSchema);