import "dotenv/config";
import axios from "axios";
import historico from "../../models/historico.js";

const token_kizeo = process.env.KIZEO_API_KEY;


async function updateHistoricoDb() {
  try {
    const [diligencias, previsitas, sinPre, conPre] = await Promise.all([
      axios.post("https://kizeoforms.com/rest/v3/forms/1056420/data/advanced", {}, { headers: { Authorization: token_kizeo } }),
      axios.post("https://kizeoforms.com/rest/v3/forms/1071447/data/advanced", {}, { headers: { Authorization: token_kizeo } }),
      axios.post("https://kizeoforms.com/rest/v3/forms/1071029/data/advanced", {}, { headers: { Authorization: token_kizeo } }),
      axios.post("https://kizeoforms.com/rest/v3/forms/1071742/data/advanced", {}, { headers: { Authorization: token_kizeo } }),
    ]);

    const registros = [
      ...diligencias.data.data,
      ...previsitas.data.data,
      ...sinPre.data.data,
      ...conPre.data.data,
    ];

    const bulkOps = registros.map((registro) => {
      const { _id, ...resto } = registro;
      return {
        updateOne: {
          filter: { "data.external_id": _id },
          update: { $set: { data: { external_id: _id, ...resto } } },
          upsert: true,
        },
      };
    });

    const result = await historico.bulkWrite(bulkOps);
    const actualizados = result.modifiedCount + result.upsertedCount;

    return  (`✅ Documentos insertados o actualizados: ${actualizados}`);
    
  } catch (error) {
    throw new Error("❌ Error:", error.response?.data || error.message);
  }
}

export default updateHistoricoDb
