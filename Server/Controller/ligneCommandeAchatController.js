import { LigneCommandeAchat } from '../Model/associations.js';

export const createLigneCommande = async (req, res) => {
  try {
    const { quantite, prix_unitaire } = req.body;
    const montant_ligne = quantite * prix_unitaire;

    const ligne = await LigneCommandeAchat.create({ ...req.body, montant_ligne });
    res.status(201).json(ligne);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getLignesByCommande = async (req, res) => {
  try {
    const lignes = await LigneCommandeAchat.findAll({
      where: { id_commande_achat: req.params.id }
    });
    res.json(lignes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
