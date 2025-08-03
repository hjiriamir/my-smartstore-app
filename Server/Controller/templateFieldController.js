import TemplateField from "../Model/TemplateField.js";

// Champs d'un template
export const getFieldsByTemplate = async (req, res) => {
  try {
    const { template_id } = req.params;
    const fields = await TemplateField.findAll({
      where: { template_id },
      order: [["display_order", "ASC"]],
    });
    res.json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des champs" });
  }
};

export const createTemplateField = async (req, res) => {
  try {
    const field = await TemplateField.create(req.body);
    res.status(201).json(field);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création du champ" });
  }
};

export const updateTemplateField = async (req, res) => {
  try {
    const { id } = req.params;
    await TemplateField.update(req.body, { where: { id } });
    const updated = await TemplateField.findByPk(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du champ" });
  }
};

export const deleteTemplateField = async (req, res) => {
  try {
    const { id } = req.params;
    await TemplateField.destroy({ where: { id } });
    res.json({ message: "Champ supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression du champ" });
  }
};
