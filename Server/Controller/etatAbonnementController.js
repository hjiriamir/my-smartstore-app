// controllers/etatAbonnementController.js
import EtatAbonnement from "../Model/EtatAbonnement.js";
import Entreprises from "../Model/Entreprises.js";

// 🔹 Créer un nouvel état d’abonnement
export const createEtatAbonnement = async (req, res) => {
  try {
    const { entreprise_id, type_forfait, date_acceptation, date_fin, statut } = req.body;

    const entreprise = await Entreprises.findByPk(entreprise_id);
    if (!entreprise) {
      return res.status(404).json({ message: "Entreprise introuvable" });
    }

    const etat = await EtatAbonnement.create({
      entreprise_id,
      type_forfait,
      date_acceptation,
      date_fin,
      statut: statut || 'actif'
    });

    res.status(201).json(etat);
  } catch (error) {
    console.error("Erreur lors de la création de l'état d'abonnement :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Obtenir tous les états d’abonnement
export const getAllEtats = async (req, res) => {
  try {
    const etats = await EtatAbonnement.findAll({
      include: [{ model: Entreprises }]
    });
    res.status(200).json(etats);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Obtenir les abonnements actifs
export const getActifs = async (req, res) => {
  try {
    const actifs = await EtatAbonnement.findAll({
      where: { statut: 'actif' },
      include: [{ model: Entreprises }]
    });
    res.status(200).json(actifs);
  } catch (error) {
    console.error("Erreur lors de la récupération :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// 🔹 Mettre à jour le statut d’un abonnement
export const updateStatut = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut } = req.body;

    const etat = await EtatAbonnement.findByPk(id);
    if (!etat) {
      return res.status(404).json({ message: "État d'abonnement introuvable" });
    }

    etat.statut = statut;
    await etat.save();

    res.status(200).json(etat);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
