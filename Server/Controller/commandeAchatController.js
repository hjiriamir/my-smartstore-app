import { CommandeAchat, LigneCommandeAchat } from '../Model/associations.js';
import sequelize from '../Config/database1.js';

export const createCommandeAchat = async (req, res) => {
    const {
      reference,
      id_fournisseur,
      id_entreprise,
      id_magasin,
      date_commande,
      statut,
      date_livraison_prevue,
      commentaire,
      lignes = [] // tableau de lignes facultatif
    } = req.body;
  
    const t = await sequelize.transaction();
  
    try {
      // 1. Créer la commande
      const commande = await CommandeAchat.create({
        reference,
        id_fournisseur,
        id_entreprise,
        id_magasin,
        date_commande,
        statut,
        date_livraison_prevue,
        commentaire
      }, { transaction: t });
  
      let total = 0;
  
      // 2. Créer les lignes de commande associées et calculer le total
      for (const ligne of lignes) {
        const { id_produit, quantite, prix_unitaire } = ligne;
  
        const montant_ligne = quantite * prix_unitaire;
        total += montant_ligne;
  
        await LigneCommandeAchat.create({
          id_commande_achat: commande.id_commande_achat,
          id_produit,
          quantite,
          prix_unitaire,
          montant_ligne // calculé en JS
        }, { transaction: t });
      }
  
      // 3. Mettre à jour montant_total
      await commande.update({ montant_total: total }, { transaction: t });
  
      await t.commit();
  
      // 4. Récupérer la commande avec ses lignes pour retour
      const createdCommande = await CommandeAchat.findOne({
        where: { id_commande_achat: commande.id_commande_achat },
        include: [{ model: LigneCommandeAchat, as: 'lignes' }]
      });
  
      res.status(201).json(createdCommande);
  
    } catch (error) {
      await t.rollback();
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la création de la commande' });
    }
  };
  


export const getAllCommandes = async (req, res) => {
  try {
    const commandes = await CommandeAchat.findAll({
      include: { model: LigneCommandeAchat, as: 'lignes' }
    });
    res.json(commandes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
