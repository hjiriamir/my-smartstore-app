// controllers/entreprisesController.js
import Entreprises from '../Model/Entreprises.js';

// Créer une entreprise
export const createEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprises.create(req.body);
    res.status(201).json(entreprise);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer toutes les entreprises
export const getAllEntreprises = async (req, res) => {
  try {
    const entreprises = await Entreprises.findAll();
    res.json(entreprises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une entreprise par ID
export const getEntrepriseById = async (req, res) => {
  try {
    const entreprise = await Entreprises.findByPk(req.params.id);
    if (entreprise) {
      res.json(entreprise);
    } else {
      res.status(404).json({ message: 'Entreprise non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une entreprise
export const updateEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprises.findByPk(req.params.id);
    if (entreprise) {
      await entreprise.update(req.body);
      res.json(entreprise);
    } else {
      res.status(404).json({ message: 'Entreprise non trouvée' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une entreprise
export const deleteEntreprise = async (req, res) => {
  try {
    const entreprise = await Entreprises.findByPk(req.params.id);
    if (entreprise) {
      await entreprise.destroy();
      res.json({ message: 'Entreprise supprimée' });
    } else {
      res.status(404).json({ message: 'Entreprise non trouvée' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
