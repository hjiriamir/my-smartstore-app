import LabelTemplate from "../Model/LabelTemplate.js";
import TemplateField from "../Model/TemplateField.js";

// Obtenir tous les templates
export const getAllLabelTemplates = async (req, res) => {
  try {
    const templates = await LabelTemplate.findAll({
      include: [
        {
          model: TemplateField,
          as: "fields",
        },
      ],
    });
    res.json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des templates" });
  }
};

// Créer un nouveau template
export const createLabelTemplate = async (req, res) => {
  try {
    const template = await LabelTemplate.create(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création du template" });
  }
};

// Mettre à jour un template
export const updateLabelTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await LabelTemplate.update(req.body, { where: { id } });
    const updated = await LabelTemplate.findByPk(id);
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour du template" });
  }
};

// Supprimer un template
export const deleteLabelTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await LabelTemplate.destroy({ where: { id } });
    res.json({ message: "Template supprimé" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression du template" });
  }
};
