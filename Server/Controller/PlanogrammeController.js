import Planogramme from '../Model/Planogramme.js';

// Créer un planogramme
export const createPlanogramme = async (req, res) => {
  try {
    const newPlanogramme = await Planogramme.create(req.body);
    res.status(201).json(newPlanogramme);
  } catch (error) {
    console.error('Erreur création planogramme:', error);
    res.status(400).json({ error: error.message });
  }
};

// Obtenir tous les planogrammes
export const getAllPlanogrammes = async (req, res) => {
  try {
    const planogrammes = await Planogramme.findAll();
    res.status(200).json(planogrammes);
  } catch (error) {
    console.error('Erreur récupération planogrammes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir un planogramme par ID
export const getPlanogrammeById = async (req, res) => {
  try {
    const planogramme = await Planogramme.findByPk(req.params.id);
    if (planogramme) {
      res.status(200).json(planogramme);
    } else {
      res.status(404).json({ error: 'Planogramme non trouvé' });
    }
  } catch (error) {
    console.error('Erreur récupération planogramme:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un planogramme
export const updatePlanogramme = async (req, res) => {
  try {
    const [updatedRows] = await Planogramme.update(req.body, {
      where: { planogram_id: req.params.id }
    });
    if (updatedRows === 0) {
      res.status(404).json({ error: 'Planogramme non trouvé' });
    } else {
      res.status(200).json({ message: 'Planogramme mis à jour' });
    }
  } catch (error) {
    console.error('Erreur mise à jour planogramme:', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un planogramme
export const deletePlanogramme = async (req, res) => {
  try {
    const deletedRows = await Planogramme.destroy({
      where: { planogram_id: req.params.id }
    });
    if (deletedRows === 0) {
      res.status(404).json({ error: 'Planogramme non trouvé' });
    } else {
      res.status(200).json({ message: 'Planogramme supprimé' });
    }
  } catch (error) {
    console.error('Erreur suppression planogramme:', error);
    res.status(500).json({ error: error.message });
  }
};
