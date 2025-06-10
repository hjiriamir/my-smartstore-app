import Fournisseur from '../Model/Fournisseur.js';

// Créer un fournisseur
export const createFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.create(req.body);
    res.status(201).json(fournisseur);
  } catch (error) {
    console.error('Erreur création fournisseur :', error);
    res.status(400).json({ error: error.message });
  }
};

// Récupérer tous les fournisseurs
export const getAllFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await Fournisseur.findAll();
    res.status(200).json(fournisseurs);
  } catch (error) {
    console.error('Erreur récupération fournisseurs :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer un fournisseur par ID
export const getFournisseurById = async (req, res) => {
  try {
    const { fournisseur_id } = req.params;
    const fournisseur = await Fournisseur.findByPk(fournisseur_id);
    if (!fournisseur) {
      return res.status(404).json({ error: 'Fournisseur non trouvé' });
    }
    res.status(200).json(fournisseur);
  } catch (error) {
    console.error('Erreur récupération fournisseur :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour un fournisseur
export const updateFournisseur = async (req, res) => {
  try {
    const { fournisseur_id } = req.params;
    const [updatedRows] = await Fournisseur.update(req.body, { where: { fournisseur_id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Fournisseur non trouvé ou aucune modification' });
    }
    const updatedFournisseur = await Fournisseur.findByPk(fournisseur_id);
    res.status(200).json(updatedFournisseur);
  } catch (error) {
    console.error('Erreur mise à jour fournisseur :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer un fournisseur
export const deleteFournisseur = async (req, res) => {
  try {
    const { fournisseur_id } = req.params;
    const deletedRows = await Fournisseur.destroy({ where: { fournisseur_id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Fournisseur non trouvé' });
    }
    res.status(200).json({ message: 'Fournisseur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression fournisseur :', error);
    res.status(500).json({ error: error.message });
  }
};

// Créer plusieurs fournisseurs
export const createFournisseursList = async (req, res) => {
  try {
    const fournisseurs = req.body;
    if (!Array.isArray(fournisseurs) || fournisseurs.length === 0) {
      return res.status(400).json({ error: 'Le corps de la requête doit être un tableau non vide' });
    }
    const createdFournisseurs = await Fournisseur.bulkCreate(fournisseurs, { validate: true });
    res.status(201).json(createdFournisseurs);
  } catch (error) {
    console.error('Erreur création liste de fournisseurs :', error);
    res.status(400).json({ error: error.message });
  }
};
