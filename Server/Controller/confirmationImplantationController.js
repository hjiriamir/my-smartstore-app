import ConfirmationImplantation from '../Model/ConfirmationImplantation.js';

// Créer une confirmation
export const createConfirmation = async (req, res) => {
  try {
    const confirmation = await ConfirmationImplantation.create(req.body);
    res.status(201).json(confirmation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la confirmation." });
  }
};

// Lire toutes les confirmations
export const getAllConfirmations = async (req, res) => {
  try {
    const confirmations = await ConfirmationImplantation.findAll();
    res.status(200).json(confirmations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des confirmations." });
  }
};

// Lire une confirmation par ID
export const getConfirmationById = async (req, res) => {
  try {
    const confirmation = await ConfirmationImplantation.findByPk(req.params.id);
    if (!confirmation) return res.status(404).json({ error: "Confirmation non trouvée." });
    res.status(200).json(confirmation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération de la confirmation." });
  }
};

// Mettre à jour une confirmation
export const updateConfirmation = async (req, res) => {
  try {
    const confirmation = await ConfirmationImplantation.findByPk(req.params.id);
    if (!confirmation) return res.status(404).json({ error: "Confirmation non trouvée." });

    await confirmation.update(req.body);
    res.status(200).json(confirmation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de la confirmation." });
  }
};

// Supprimer une confirmation
export const deleteConfirmation = async (req, res) => {
  try {
    const confirmation = await ConfirmationImplantation.findByPk(req.params.id);
    if (!confirmation) return res.status(404).json({ error: "Confirmation non trouvée." });

    await confirmation.destroy();
    res.status(200).json({ message: "Confirmation supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression de la confirmation." });
  }
};
