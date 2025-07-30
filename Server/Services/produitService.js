
import Produit from "../Model/Produit.js";
import Vente from "../Model/Ventes.js";
import {getCategoriesByStore} from "./categorieService.js"
import { getPastPeriods } from "./zoneService.js";
import { fn, col, Op } from 'sequelize';

export const getProduitsByCategorie = async(idCategorie) => {
    try {
        if (!idCategorie) {
            throw new Error("Le paramètre idCategorie est obligatoire");
          }
    
    const produits = await Produit.findAll({
        where: {categorie_id: idCategorie}
    })
    
    return produits;
        
    } catch (error) {
        console.error("Erreur dans getProduitsByCategorie:", error);
      throw error;
    }
}


export const getProduitsByStore = async(idMagasin) => {
    try {
        if (!idMagasin) {
            throw new Error("Le paramètre idMagasin est obligatoire");
          }
    const categories = getCategoriesByStore(idMagasin)
    const categoriesIds = categories.map(c => c.categorie_id);

    const produits = await Produit.findAll({
            where: { categorie_id_id: { [Op.in]: categoriesIds }
            }
        });
    
    return produits;
        
    } catch (error) {
        console.error("Erreur dans getProduitsByCategorie:", error);
      throw error;
    }
}


export const getPerformanceProduitMoyenByStore = async (idMagasin, date_debut, date_fin) => {
    try {
      if (!idMagasin) {
        throw new Error("Le paramètre idMagasin est obligatoire");
      }
  
      const start = new Date(date_debut);
      const end = new Date(date_fin);
  
      // 1. Récupérer les ventes actuelles par produit avec jointure sur Produit
      const ventesActuelles = await Vente.findAll({
        where: {
          magasin_id: idMagasin,
          date_vente: {
            [Op.gte]: start,
            [Op.lte]: end,
          },
        },
        attributes: [
          'produit_id',
          [fn('SUM', col('montant_total')), 'total_ventes']
        ],
        include: [
          {
            model: Produit,
            as:'produit',
            attributes: ['nom'], // On récupère le nom du produit
          }
        ],
        group: ['produit_id', 'Produit.nom'],
        raw: true,
        nest: true // pour accéder directement à Produit.nom
      });
  
      // Indexer les ventes actuelles par produit
      const ventesActuellesMap = {};
      const produitsNomMap = {};
      ventesActuelles.forEach(v => {
        ventesActuellesMap[v.produit_id] = parseFloat(v.total_ventes) || 0;
        produitsNomMap[v.produit_id] = v.produit.nom;
      });
  
      // 2. Récupérer les ventes passées par période avec jointure produit
      const pastPeriods = getPastPeriods(date_debut, date_fin);
  
      const ventesPasséesPromises = pastPeriods.map(period =>
        Vente.findAll({
          where: {
            magasin_id: idMagasin,
            date_vente: {
              [Op.gte]: period.date_debut,
              [Op.lte]: period.date_fin,
            },
          },
          attributes: [
            'produit_id',
            [fn('SUM', col('montant_total')), 'total_ventes']
          ],
          include: [
            {
              model: Produit,
              as:'produit',
              attributes: ['nom'],
            }
          ],
          group: ['produit_id', 'Produit.nom'],
          raw: true,
          nest: true
        })
      );
  
      const ventesParPériode = await Promise.all(ventesPasséesPromises);
  
      // Agréger les ventes passées par produit
      const ventesPastParProduit = {};
      ventesParPériode.flat().forEach(v => {
        const produitId = v.produit_id;
        const montant = parseFloat(v.total_ventes) || 0;
  
        if (!ventesPastParProduit[produitId]) {
          ventesPastParProduit[produitId] = { total: 0, count: 0 };
        }
  
        ventesPastParProduit[produitId].total += montant;
        ventesPastParProduit[produitId].count += 1;
  
        // Si le nom n'est pas encore enregistré, on le prend
        if (!produitsNomMap[produitId]) {
          produitsNomMap[produitId] = v.Produit.nom;
        }
      });
  
      // Calculer la moyenne passée par produit
      const moyennePastParProduit = {};
      for (const [produitId, stats] of Object.entries(ventesPastParProduit)) {
        moyennePastParProduit[produitId] =
          stats.count > 0 ? stats.total / stats.count : 0;
      }
  
      // Fonction pour donner une recommandation selon la variation
      const getRecommendation = (diff) => {
        if (diff <= 0) return "En baisse – revoir la stratégie";
        if (diff <= 15) return "Stabilisé – continuer les actions actuelles";
        if (diff <= 30) return "Bonne progression – pousser les promos";
        if (diff <= 100) return "Forte croissance – maintenir le rythme";
        return "Explosion des ventes – capitaliser !";
      };
  
      // 3. Préparer les résultats par produit
      const allProduitsIds = new Set([
        ...Object.keys(ventesActuellesMap),
        ...Object.keys(moyennePastParProduit),
      ]);
  
      const resultats = Array.from(allProduitsIds).map(produitId => {
        const actuel = ventesActuellesMap[produitId] || 0;
        const moyennePast = moyennePastParProduit[produitId] || 0;
  
        let variation = 0;
        let diffVariation = 0;
  
        if (moyennePast > 0) {
          variation = (actuel / moyennePast) * 100;
          diffVariation = ((actuel - moyennePast) / moyennePast) * 100;
        }
  
        const diffVariationStr =
          diffVariation > 0
            ? `+${diffVariation.toFixed(2)}`
            : diffVariation.toFixed(2);
  
        return {
          produitId,
          nom: produitsNomMap[produitId] || "Inconnu",
          ventesActuelles: actuel,
          moyennePast,
          variation: parseFloat(variation.toFixed(2)),
          diffVariation: diffVariationStr,
          recommendation: getRecommendation(diffVariation),
        };
      });
  
      return {
        idMagasin,
        periode: { date_debut, date_fin },
        produits: resultats,
      };
    } catch (error) {
      console.error("Erreur dans getPerformanceProduitMoyenByStore:", error);
      throw error;
    }
  };
  


