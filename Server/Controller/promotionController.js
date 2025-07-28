import Promotion from '../Model/Promotion.js';
import magasin1 from "../Model/magasin1.js";
import { Sequelize, Op } from "sequelize";
import Vente from '../Model/Ventes.js';
import Produit from '../Model/Produit.js';

// Créer une promotion
export const createPromotion = async (req, res) => {
  try {
    let { magasin_id, ...promoData } = req.body;

    if (!magasin_id) {
      return res.status(400).json({ error: "magasin_id obligatoire" });
    }

    // Normalisation : un seul ou plusieurs magasins
    let listeMagasins = [];
    if (Array.isArray(magasin_id)) {
      listeMagasins = magasin_id;
    } else if (typeof magasin_id === "string") {
      listeMagasins = magasin_id.split(",").map((id) => id.trim());
    } else {
      listeMagasins = [String(magasin_id)];
    }

    let promotionsCreees = [];

    // Crée une promotion par magasin
    for (const mag of listeMagasins) {
      const promotion = await Promotion.create({
        ...promoData,
        magasin_id: mag,
      });
      promotionsCreees.push(promotion);
    }

    res.status(201).json({
      message: "Promotion(s) créée(s) avec succès",
      data: promotionsCreees,
    });
  } catch (error) {
    console.error("Erreur création promotion :", error);
    res.status(400).json({ error: error.message });
  }
};


// Récupérer toutes les promotions
export const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.findAll();
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Erreur récupération promotions :', error);
    res.status(500).json({ error: error.message });
  }
};

// Récupérer une promotion par ID
export const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ error: 'Promotion non trouvée' });
    }
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Erreur récupération promotion :', error);
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une promotion par ID
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRows] = await Promotion.update(req.body, { where: { promotion_id: id } });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Promotion non trouvée ou aucune modification' });
    }
    const updatedPromotion = await Promotion.findByPk(id);
    res.status(200).json(updatedPromotion);
  } catch (error) {
    console.error('Erreur mise à jour promotion :', error);
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une promotion par ID
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRows = await Promotion.destroy({ where: { promotion_id: id } });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Promotion non trouvée' });
    }
    res.status(200).json({ message: 'Promotion supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression promotion :', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActivePromotions = async (req, res) => {
  try {
    const { idMagasin, idEntreprise } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }

    const now = new Date();

    const magasinFilter = { entreprise_id: idEntreprise };
    if (idMagasin && idMagasin !== "all") {
      magasinFilter.magasin_id = idMagasin;
    }

    const promos = await Promotion.findAndCountAll({
      where: {
        date_debut: { [Op.lte]: now },
        date_fin: { [Op.gte]: now },
      },
      include: [
        {
          model: magasin1,
          as: 'magasin',
          required: true,
          where: magasinFilter,
        },
      ],
    });

    // Ajouter l'attribut 'etat' à chaque promo
    const promosWithEtat = promos.rows.map(promo => ({
      ...promo.get({ plain: true }),
      etat: "active"
    }));

    // Renvoie la structure avec count et promos modifiés
    res.json({
      count: promos.count,
      rows: promosWithEtat
    });

  } catch (error) {
    console.error("Erreur lors de la récupération des promotions:", error);
    res.status(500).json({ error: error.message });
  }
};


export const getPromotionsByEntrepriseAndMagsins = async (req, res) => {
  try {
    let { idMagasin, idEntreprise } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }

    // Normaliser idMagasin en tableau de strings
    let listeMagasins = [];
    if (idMagasin) {
      if (Array.isArray(idMagasin)) {
        listeMagasins = idMagasin.map((id) => id.trim());
      } else if (typeof idMagasin === "string") {
        listeMagasins = idMagasin.split(",").map((id) => id.trim());
      } else {
        listeMagasins = [String(idMagasin)];
      }
    }

    // Filtre magasins
    const whereMagasin = {
      entreprise_id: idEntreprise,
      ...(listeMagasins.length > 0 && { magasin_id: { [Op.in]: listeMagasins } })
    };

    const magasins = await magasin1.findAll({
      where: whereMagasin,
      attributes: ["magasin_id"],
    });

    const magasinsIds = magasins.map((m) => m.magasin_id);

    if (magasinsIds.length === 0) {
      return res.status(404).json({ error: "Aucun magasin trouvé." });
    }

    // Récupérer les promotions
    const promos = await Promotion.findAll({
      where: {
        magasin_id: {
          [Op.in]: magasinsIds,
        },
      },
    });

    const now = new Date();

    // Ajouter le taux de progression à chaque promotion
    const promosAvecProgression = promos.map((promo) => {
      const debut = new Date(promo.date_debut);
      const fin = new Date(promo.date_fin);

      let taux = 0;
      if (now <= debut) {
        taux = 0;
      } else if (now >= fin) {
        taux = 100;
      } else {
        taux = ((now - debut) / (fin - debut)) * 100;
      }

      return {
        ...promo.toJSON(),
        taux_progression: Math.round(taux),
      };
    });

    return res.json(promosAvecProgression);

  } catch (error) {
    console.error("Erreur lors de la récupération des promos :", error);
    res.status(500).json({ error: error.message });
  }
};



export const getRevenuPromo = async (req, res) => {
  try {
    const { idMagasin, idEntreprise } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }

    const now = new Date();

    // Filtre magasin / entreprise comme dans getActivePromotions
    const magasinFilter = { entreprise_id: idEntreprise };
    if (idMagasin && idMagasin !== "all") {
      magasinFilter.magasin_id = idMagasin;
    }

    // Récupérer les ids des produits en promotion actives avec filtre magasin/entreprise
    const promos = await Promotion.findAll({
      attributes: ['produit_id'],
      where: {
        date_debut: { [Op.lte]: now },
        date_fin: { [Op.gte]: now },
      },
      include: [
        {
          model: magasin1,
          as: 'magasin',
          required: true,
          where: magasinFilter,
        }
      ],
      raw: true,
    });

    const produitIds = promos.map(p => p.produit_id);
    if (produitIds.length === 0) {
      return res.json(0); // Pas de produits promo => revenu = 0
    }

    // Calcul direct de la somme via Sequelize (SUM)
    const { sum } = await Vente.findOne({
      attributes: [
        [Vente.sequelize.fn('SUM', Vente.sequelize.col('montant_total')), 'sum']
      ],
      where: {
        produit_id: produitIds
      },
      raw: true,
    });

    res.json(Number(sum) || 0);

  } catch (error) {
    console.error("Erreur lors de la récupération des revenus promotions:", error);
    res.status(500).json({ error: error.message });
  }
};

/*export const getCoutTotal = async(req,res) => {
  try {
    const { idMagasin, idEntreprise } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }
     // 1. Récupérer toutes les promotions actives avec les produits associés
     const promotions = await Promotion.findAll({
      where: {
        [Op.or]: [
          { etat: 'active' },
          { etat: 'terminée' }
        ]
      }, 
      include: [{
        model: Produit,
        attributes: ['id','produit_id', 'prix'] // On a besoin du prix pour calculer la réduction
      }]
    });
    
    // 2. Calculer le coût total des réductions
    let totalCost = 0;

  } catch (error) {
    console.error("Erreur lors de la récupération du cout total:", error);
    res.status(500).json({ error: error.message });
  }
}*/

/*export const getCoutTotal = async (req, res) => {
  try {
    const { idMagasin, idEntreprise } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }

    //const magasinFilter = { entreprise_id: idEntreprise }
    const magasinFilter = await magasin1.findAll({
      where:{entreprise_id:idEntreprise}
    })
    console.log('magasinFilter 1 :', magasinFilter);
    if (idMagasin) {
      magasinFilter = await magasin1.findOne({
        where: {magasin_id: idMagasin}
      });
    }
    console.log('magasinFilter 2 :', magasinFilter);

    // 1. Récupérer promotions actives ou terminées avec produits et magasins filtrés
    const promotions = await Promotion.findAll({
      where: {
        [Op.or]: [
          { etat: 'active' },
          { etat: 'terminée' }
        ]
      },
      include: [
        {
          model: Produit,
          attributes: ['id', 'prix']
        },
        {
          model: magasin1,
          as: 'magasin',
          required: true,
         // where: magasinFilter
        }
      ]
    });

    if (promotions.length === 0) {
      return res.json({ coutTotal: 0 });
    }

    // 2. Préparer liste des produits en promo avec date debut et discount
    const promoProduits = promotions.map(promo => ({
      produit_id: promo.Produit.id,
      date_debut: promo.date_debut,
      discount: promo.discount / 100,
      prix: promo.Produit.prix
    }));

    const produitIds = promoProduits.map(p => p.produit_id);

    // 3. Récupérer les ventes des produits concernés
    const ventes = await Vente.findAll({
      where: {
        produit_id: produitIds,
      },
      raw: true
    });

    // 4. Calcul du cout total des réductions
    let coutTotal = 0;

    for (const vente of ventes) {
      const promoProduit = promoProduits.find(p => p.produit_id === vente.produit_id);
      if (!promoProduit) continue;

      if (new Date(vente.date_vente) >= new Date(promoProduit.date_debut)) {
        const quantite = vente.quantite || 1;
        const reduction = promoProduit.prix * quantite * promoProduit.discount;
        coutTotal += reduction;
      }
    }

    res.json({ coutTotal });

  } catch (error) {
    console.error("Erreur lors de la récupération du cout total:", error);
    res.status(500).json({ error: error.message });
  }
};*/


export const getCoutTotal = async (req, res) => {
  try {
    const { idMagasin, idEntreprise } = req.query;

    if (!idEntreprise) {
      return res.status(400).json({ error: "idEntreprise manquant." });
    }

    // 1. Récupérer les magasins de l'entreprise
    const whereMagasin = { 
      entreprise_id: idEntreprise,
      ...(idMagasin && { magasin_id: idMagasin })
    };

    const magasins = await magasin1.findAll({
      where: whereMagasin,
      attributes: ['magasin_id'],
      raw: true
    });

    if (!magasins.length) {
      return res.status(404).json({ error: "Aucun magasin trouvé." });
    }

    const magasinIds = magasins.map(m => m.magasin_id);

    // 2. Récupérer les promotions actives/terminées pour ces magasins
    const promos = await Promotion.findAll({
      where: {
        magasin_id: { [Op.in]: magasinIds },
        etat: { [Op.in]: ['active', 'terminée'] }
      },
      attributes: ['produit_id', 'magasin_id', 'date_debut', 'discount'],
      raw: true
    });

    if (!promos.length) {
      return res.status(404).json({ 
        coutTotalVentes: 0,
        coutTotalReductions: 0,
        message: "Aucune promotion trouvée." 
      });
    }

    // 3. Récupérer les prix des produits concernés
    const produitsIds = [...new Set(promos.map(p => p.produit_id))];
    const produits = await Produit.findAll({
      where: { produit_id: { [Op.in]: produitsIds } },
      attributes: ['produit_id', 'prix'],
      raw: true
    });

    const produitsMap = produits.reduce((map, produit) => {
      map.set(produit.produit_id, produit.prix);
      return map;
    }, new Map());

    // 4. Créer un map des promotions par produit ET magasin
    const promoMap = promos.reduce((map, promo) => {
      const key = `${promo.produit_id}_${promo.magasin_id}`;
      if (!map.has(key) || map.get(key).date_debut > promo.date_debut) {
        map.set(key, {
          date_debut: promo.date_debut,
          discount: promo.discount / 100 // Convertir 30% en 0.3
        });
      }
      return map;
    }, new Map());

    // 5. Récupérer les ventes correspondantes
    const toutesVentes = await Vente.findAll({
      where: {
        produit_id: { [Op.in]: produitsIds },
        magasin_id: { [Op.in]: magasinIds }
      },
      raw: true
    });

    // 6. Calculer les totaux
    let coutTotalVentes = 0;
    let coutTotalReductions = 0;
    const ventesAvecDetails = [];

    toutesVentes.forEach(vente => {
      const key = `${vente.produit_id}_${vente.magasin_id}`;
      const promoInfo = promoMap.get(key);
      const prixProduit = produitsMap.get(vente.produit_id) || 0;

      if (promoInfo && new Date(vente.date_vente) > new Date(promoInfo.date_debut)) {
        const montantBase = vente.quantite * prixProduit;
        const reduction = montantBase * promoInfo.discount;
        const montantApresReduction = montantBase - reduction;

        coutTotalVentes += montantApresReduction;
        coutTotalReductions += reduction;

        ventesAvecDetails.push({
          vente_id: vente.vente_id,
          produit_id: vente.produit_id,
          magasin_id: vente.magasin_id,
          quantite: vente.quantite,
          prix_unitaire: prixProduit,
          date_vente: vente.date_vente,
          discount: promoInfo.discount * 100,
          montant_avant_reduction: montantBase,
          montant_reduction: reduction,
          montant_apres_reduction: montantApresReduction
        });
      }
    });

    // 7. Préparer la réponse
    const response = {
      nombreVentes: ventesAvecDetails.length,
      coutTotalVentes: parseFloat(coutTotalVentes.toFixed(2)),
      coutTotalReductions: parseFloat(coutTotalReductions.toFixed(2)),
      details: ventesAvecDetails
    };

    res.json(response);

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      error: "Erreur serveur",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};






