import Tache from '../Model/Tache.js';

// Créer une tâche
export const createTache = async (req, res) => {
  try {
    const tache = await Tache.create(req.body);
    res.status(201).json(tache);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la tâche." });
  }
};

// Obtenir toutes les tâches
export const getAllTaches = async (req, res) => {
  try {
    const taches = await Tache.findAll();
    res.status(200).json(taches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des tâches." });
  }
};

// Obtenir une tâche par ID
export const getTacheById = async (req, res) => {
  try {
    const tache = await Tache.findByPk(req.params.id);
    if (!tache) return res.status(404).json({ error: "Tâche non trouvée." });
    res.status(200).json(tache);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de la tâche." });
  }
};

// Mettre à jour une tâche
export const updateTache = async (req, res) => {
  try {
    const tache = await Tache.findByPk(req.params.id);
    if (!tache) return res.status(404).json({ error: "Tâche non trouvée." });

    await tache.update(req.body);
    res.status(200).json(tache);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la tâche." });
  }
};

// Supprimer une tâche
export const deleteTache = async (req, res) => {
  try {
    const tache = await Tache.findByPk(req.params.id);
    if (!tache) return res.status(404).json({ error: "Tâche non trouvée." });

    await tache.destroy();
    res.status(200).json({ message: "Tâche supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de la tâche." });
  }
};
