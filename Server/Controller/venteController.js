import Vente from '../Model/Ventes.js';
import sequelize from '../Config/database1.js';
import Stock from '../Model/Stock.js';
import { createStockMovement } from './stockMovementController.js';
import magasin1 from '../Model/magasin1.js'
import { where } from 'sequelize';
import StockMovement from '../Model/StockMovement.js';
import CommandeAchat from '../Model/CommandeAchat.js';
import LigneCommandeAchat from '../Model/LigneCommandeAchat.js';
import {Op, Sequelize } from 'sequelize'
import Produit from '../Model/Produit.js';
import Categorie1 from '../Model/Categorie1.js';
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
      // Appel de la création du mouvement de stock correspondant (sortie)
    const fakeReq = {
      body: {
        produit_id: vente.produit_id,
        magasin_id: vente.magasin_id,
        quantite: vente.quantite,
        cout_unitaire: vente.prix_unitaire,
        valeur_mouvement: vente.montant_total,
        type_mouvement: 'sortie', // ici on précise que c'est une sortie
        date_mouvement: new Date() // date actuelle
      }
    };
    const fakeRes = {
      status: (code) => ({
        json: (data) => console.log(`[StockMovement] Status ${code}`, data)
      })
    };
    try {
      await createStockMovement(fakeReq, fakeRes);
    } catch (stockError) {
      console.error('Erreur création mouvement stock:', stockError);
      return res.status(500).json({
        error: "Vente enregistrée, mais échec mouvement stock",
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



export const fetchStat = async (req, res) => {
  try {
    const { idEntreprise } = req.params;
    const { magasinId } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }

    const magasins = await magasin1.findAll({
      where: { entreprise_id: idEntreprise },
      attributes: ['id', 'magasin_id', 'nom_magasin']
    });

    // Retourner des données vides si aucun magasin n'est trouvé
    if (!magasins || magasins.length === 0) {
      return res.status(200).json({
        todaySales: 0,
        yearlySales: 0,
        netIncome: 0,
        produitsEnStock: 0,
        mouvementsStock: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          in: 0,
          out: 0
        })),
        commandesParStatut: {},
        commandesParCanal: {},
        commandes: [],
        magasinsDisponibles: []
      });
    }

    const magasinUniqueIds = magasins.map(m => m.magasin_id);

    let selectedMagasinId = null;
    if (magasinId) {
      const magasin = magasins.find(m => m.id === parseInt(magasinId));
      if (!magasin) {
        return res.status(400).json({ error: "Le magasin sélectionné n'appartient pas à cette entreprise." });
      }
      selectedMagasinId = magasin.magasin_id;
    }

    const conditionVentesStocks = selectedMagasinId 
      ? { magasin_id: selectedMagasinId }
      : { magasin_id: { [Op.in]: magasinUniqueIds } };

    const conditionCommandes = { 
      id_entreprise: idEntreprise,
      ...(magasinId && { id_magasin: parseInt(magasinId) })
    };

    const conditionCategorie = selectedMagasinId
      ? { magasin_id: selectedMagasinId }
      : { magasin_id: { [Op.in]: magasinUniqueIds } };

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      ventesAujourdhui,
      ventesCetteAnnee,
      stockMouvements,
      commandes,
      produits,
      mouvementsStockAnnee
    ] = await Promise.all([
      Vente.findAll({
        where: {
          ...conditionVentesStocks,
          date_vente: { [Op.gte]: startOfToday }
        }
      }),
      Vente.findAll({
        where: {
          ...conditionVentesStocks,
          date_vente: { [Op.gte]: startOfYear }
        }
      }),
      StockMovement.findAll({ where: conditionVentesStocks }),
      CommandeAchat.findAll({
        where: conditionCommandes,
        include: { model: LigneCommandeAchat, as: 'lignes' }
      }),
      Produit.findAll({
        attributes: ['id', 'nom', 'prix', 'stock'],
        include: [{
          model: Categorie1,
          as: 'categorie',
          attributes: [],
          where: conditionCategorie
        }]
      }),
      StockMovement.findAll({
        where: {
          ...conditionVentesStocks,
          date_mouvement: { [Op.gte]: startOfYear }
        },
        attributes: [
          [Sequelize.fn('MONTH', Sequelize.col('date_mouvement')), 'month'],
          'type_mouvement',
          [Sequelize.fn('SUM', Sequelize.col('quantite')), 'total']
        ],
        group: ['month', 'type_mouvement']
      })
    ]);

    // === Statistiques ===

    // Ventes aujourd'hui
    const todaySales = ventesAujourdhui.reduce((total, vente) => {
      return total + parseFloat(vente.montant_total || (vente.prix_unitaire * vente.quantite));
    }, 0);

    // Ventes cette année
    const yearlySales = ventesCetteAnnee.reduce((total, vente) => {
      return total + parseFloat(vente.montant_total || (vente.prix_unitaire * vente.quantite));
    }, 0);
    
    // Revenu net cette année
    let netIncome = 0;
    ventesCetteAnnee.forEach(vente => {
      const produit = produits.find(p => p.id === vente.produit_id);
      if (produit) {
        const coutAchat = produit.prix_achat || 0;
        const revenu = (vente.prix_unitaire - coutAchat) * vente.quantite;
        netIncome += revenu;
      }
    });

    // Produits en stock
    const produitsEnStock = produits.filter(p => p.stock > 0).length;

    // Mouvements stock par mois
    const mouvementsParMois = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      in: 0,
      out: 0
    }));

    mouvementsStockAnnee.forEach(mvt => {
      const month = mvt.dataValues.month;
      const type = mvt.type_mouvement;
      const total = parseFloat(mvt.dataValues.total) || 0;

      const mois = mouvementsParMois.find(m => m.month === month);
      if (mois) {
        if (type === 'entrée') {
          mois.in += total;
        } else if (type === 'sortie') {
          mois.out += total;
        }
      }
    });
    
    // Commandes par statut
    const commandesParStatut = {};
    // Commandes par canal
    const commandesParCanal = {};

    commandes.forEach(cmd => {
      const statut = cmd.statut || 'inconnu';
      const canal = cmd.canal || 'inconnu';
    
      // Statistiques par statut globales
      commandesParStatut[statut] = (commandesParStatut[statut] || 0) + 1;
    
      // Statistiques par canal + statut
      if (!commandesParCanal[canal]) {
        commandesParCanal[canal] = {};
      }
      commandesParCanal[canal][statut] = (commandesParCanal[canal][statut] || 0) + 1;
    });
    

    // Formatage des commandes avec leurs lignes
    const commandesFormatees = commandes.map(commande => ({
      id: commande.id,
      numero_commande: commande.numero_commande,
      date_commande: commande.date_commande,
      statut: commande.statut,
      canal: commande.canal, // Ajout du canal dans les données des commandes
      montant_total: commande.montant_total,
      magasin_id: commande.magasin_id,
      id_entreprise: commande.id_entreprise,
      lignes: commande.lignes.map(ligne => ({
        id: ligne.id,
        id_produit: ligne.id_produit,
        quantite: ligne.quantite,
        prix_unitaire: ligne.prix_unitaire,
        montant_ligne: ligne.montant_ligne
      }))
    }));

    // Réponse
    res.status(200).json({
      todaySales,
      yearlySales,
      netIncome,
      produitsEnStock,
      mouvementsStock: mouvementsParMois,
      commandesParStatut,
      commandesParCanal, 
      commandes: commandesFormatees,
      magasinsDisponibles: magasins.map(m => ({ id: m.id, magasin_id: m.magasin_id, nom_magasin: m.nom_magasin }))
    });

  } catch (error) {
    console.error('Erreur fetchStat:', error);
    res.status(500).json({
      error: "Erreur lors de la récupération des statistiques",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
