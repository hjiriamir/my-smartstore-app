import Vente from '../Model/Ventes.js';
import sequelize from '../Config/database1.js';
import Stock from '../Model/Stock.js';

// Mise a jour du stock 
async function updateStock(produit_id, magasin_id, quantite) {
  try {
    // Chercher le stock en fonction de produit_id et magasin_id (clé primaire composée)
    const stockProduit = await Stock.findOne({
      where: { produit_id, magasin_id }
    });

    if (!stockProduit) {
      // Si pas de stock existant alert   
        throw new Error("Stock inexistant pour ce produit et magasin");  
    }
    // Mettre à jour la quantité 
    stockProduit.quantite -= quantite;
    // Mettre à jour la date de modification
    stockProduit.date_maj = new Date();
    // Sauvegarder en base
    await stockProduit.save();
    return stockProduit;
  } catch (error) {
    console.error("Erreur updateStock:", error);
    throw error;
  }
}

// Créer une nouvelle vente
export const createVente = async (req, res) => {
    try {
      // Calcul automatique du montant_total si non fourni
      if (!req.body.montant_total) {
        req.body.montant_total = req.body.quantite * req.body.prix_unitaire;
      }
  
      const vente = await Vente.create(req.body);
  
      // Mise à jour du stock avec gestion d'erreurs
      try {
        await updateStock(vente.produit_id, vente.magasin_id, vente.quantite); // quantité négative pour sortie
      } catch (stockError) {
        console.error('Erreur mise à jour du stock:', stockError);
        // Si la vente est déjà enregistrée mais le stock échoue, tu peux :  
        // - soit annuler la vente (rollback), mais Sequelize simple n'a pas de transaction automatique  
        // - soit signaler le problème tout en gardant la vente enregistrée  
        return res.status(500).json({
          error: "Vente enregistrée mais échec mise à jour stock",
          vente,
          details: stockError.message
        });
      }
  
      res.status(201).json(vente);
    } catch (error) {
      console.error('Erreur création vente:', error);
      res.status(400).json({ 
        error: error.message,
        details: {
          produit_id: "Doit être un ID de produit valide",
          magasin_id: "Doit être un ID de magasin valide",
          quantite: "Doit être un entier positif",
          prix_unitaire: "Doit être un nombre décimal positif"
        }
      });
    }
  };
  

// Récupérer toutes les ventes
export const getAllVentes = async (req, res) => {
  try {
    const ventes = await Vente.findAll();
    res.status(200).json(ventes);
  } catch (error) {
    console.error('Erreur récupération ventes:', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une vente par ID
export const getVenteById = async (req, res) => {
  try {
    const vente = await Vente.findByPk(req.params.id);
    if (!vente) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }
    res.status(200).json(vente);
  } catch (error) {
    console.error('Erreur récupération vente:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une vente
export const updateVente = async (req, res) => {
  try {
    // Recalcul du montant si quantite ou prix_unitaire sont modifiés
    if (req.body.quantite || req.body.prix_unitaire) {
      const existingVente = await Vente.findByPk(req.params.id);
      const quantite = req.body.quantite || existingVente.quantite;
      const prix = req.body.prix_unitaire || existingVente.prix_unitaire;
      req.body.montant_total = quantite * prix;
    }

    const [updated] = await Vente.update(req.body, {
      where: { vente_id: req.params.id }
    });
    
    if (updated) {
      const updatedVente = await Vente.findByPk(req.params.id);
      return res.status(200).json(updatedVente);
    }
    throw new Error('Vente non trouvée');
  } catch (error) {
    console.error('Erreur mise à jour vente:', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une vente
export const deleteVente = async (req, res) => {
  try {
    const deleted = await Vente.destroy({
      where: { vente_id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    throw new Error('Vente non trouvée');
  } catch (error) {
    console.error('Erreur suppression vente:', error);
    res.status(400).json({ error: error.message });
  }
};

// Statistiques de ventes
export const getStats = async (req, res) => {
  try {
    const stats = await Vente.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('montant_total')), 'chiffre_affaires'],
        [sequelize.fn('COUNT', sequelize.col('vente_id')), 'nombre_ventes']
      ]
    });
    res.status(200).json(stats[0]);
  } catch (error) {
    console.error('Erreur calcul statistiques:', error);
    res.status(500).json({ error: error.message });
  }
};