

export function getHome(req, res) {
  res.status(200).render("index", { title: "Bienvenido a KizeoApp" });
}

export function getFusionarExcel(req, res) {
  res.render("viewFusionarExcel");
}

export function getUpdateList(req, res) {
  res.render("viewUpdateList");
}

export const postUpdateList = async (req, res) => {
  try {
    const response = await procesarActa(req.body.data);
    res.status(200).json({ message: response });
  } catch (error) {
    res.status(400).json({ message: "Error al subir el acta: " + error.message });
  }
}