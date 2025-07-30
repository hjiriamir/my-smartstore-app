import {getCategoriesByZone} from './categorieService.js'
import {getProduitsByCategorie} from './produitService.js'
import Vente from '../Model/Ventes.js';
import Produit from '../Model/Produit.js';
import { Op } from 'sequelize';
import Zone1 from '../Model/zone1.js';
import Categorie1 from '../Model/Categorie1.js';
import { differenceInDays, subMonths, subYears } from "date-fns";
import ZoneVisites from '../Model/ZoneVisites.js'

export const getProduitsByZone = async(idZone, idMagasin) => {
    try {
        if (!idZone) {
            throw new Error("Le paramètre idZone est obligatoire");
        }
    
        // 1. Récupérer les catégories du magasin
        const categories = await getCategoriesByZone(idZone, idMagasin);
        const categoriesIds = categories.map(c => c.categorie_id);
        
        if (categoriesIds.length === 0) {
            return []; // Retourner un tableau vide si pas de catégories
        }
        
        // 2. Récupérer tous les produits pour toutes les catégories (en parallèle)
        const produitsPromises = categoriesIds.map(idCategorie => 
            getProduitsByCategorie(idCategorie)
        );
        
        const produitsArrays = await Promise.all(produitsPromises);
        
        // 3. Fusionner tous les produits en un seul tableau plat
        const allProduits = produitsArrays.flat();
        
        return allProduits;
        
    } catch (error) {
        console.error("Erreur dans getProduitsByZone:", error);
        throw error;
    }
}

export const getVenteTotalByZone = async (idZone, idMagasin, date_debut, date_fin) => {
    try {
        console.log(`Début getVenteTotalByZone pour zone ${idZone} et magasin ${idMagasin}`);
        
        // 1. Configuration de la requête avec jointures optimisées
        const where = {
            magasin_id: idMagasin, // Filtre direct par magasin
            date_vente: {}
        };

        if (date_debut) {
            where.date_vente[Op.gte] = new Date(date_debut);
        }
        if (date_fin) {
            where.date_vente[Op.lte] = new Date(date_fin);
        }

        // 2. Récupération des ventes avec jointure sur Produit et Catégorie
        const ventes = await Vente.findAll({
            where,
            include: [{
                model: Produit,
                as: 'produit',
                attributes: ['nom', 'produit_id'],
                include: [{
                    model: Categorie1,
                    as:'categorie',
                    attributes: [],
                    where: { zone_id: idZone },
                    required: true
                }]
            }]
        });

        console.log(`Ventes trouvées pour zone ${idZone} et magasin ${idMagasin}:`, ventes.length);

        // 3. Calcul des totaux
        const result = ventes.reduce((acc, vente) => {
            if (!vente.produit) return acc; // Skip si pas de produit associé
            
            const montant = vente.montant_total ?? 
                          (vente.quantite * vente.prix_unitaire);
            
            acc.totalVentes += Number(montant) || 0;
            acc.nombreProduitsVendus += vente.quantite || 0;
            
            const produitIndex = acc.details.findIndex(
                d => d.produit_id === vente.produit_id
            );
            
            if (produitIndex === -1) {
                acc.details.push({
                    produit_id: vente.produit_id,
                    nom_produit: vente.produit.nom, 
                    quantite: vente.quantite,
                    montant: Number(montant) || 0
                });
            } else {
                acc.details[produitIndex].quantite += vente.quantite;
                acc.details[produitIndex].montant += Number(montant) || 0;
            }
            
            return acc;
        }, { 
            totalVentes: 0, 
            nombreProduitsVendus: 0, 
            details: [] 
        });

        result.totalVentes = parseFloat(result.totalVentes.toFixed(2));
        
        console.log(`Résultats pour zone ${idZone}:`, result);
        return result;

    } catch (error) {
        console.error("Erreur dans getVenteTotalByZone:", error);
        throw error;
    }
}

export const getZonesByMagasin = async(idMagasin) => {
    try {
        if (!idMagasin) {
            throw new Error("Le paramètre idMagasin est obligatoire");
        }
        const zones = await Zone1.findAll({
            where: {magasin_id:idMagasin} 
        })
        return zones;
    } catch (error) {
        console.error("Erreur dans getZonesByMagasin:", error);
        throw error;
    }
}



export const getPastPeriods = (date_debut, date_fin) => {
    const start = new Date(date_debut);
    const end = new Date(date_fin);
  
    const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
    const result = [];
  
    const pushInterval = (label, d1, d2) => {
      result.push({
        label,
        date_debut: new Date(d1),
        date_fin: new Date(d2)
      });
    };
  
    // Cas 1 : période très courte (1 à 3 jours)
    if (diffDays <= 3) {
      for (let i = 1; i <= diffDays; i++) {
        const dayStart = new Date(start);
        dayStart.setDate(start.getDate() - i);
        const dayEnd = new Date(dayStart);
        pushInterval(`Jour -${i}`, dayStart, dayEnd);
      }
    }
  
    // Cas 2 : période de 7 jours
    else if (diffDays === 7) {
      let refEnd = new Date(start);
      for (let i = 1; i <= 4; i++) {
        const weekStart = new Date(refEnd);
        weekStart.setDate(refEnd.getDate() - 7);
        pushInterval(`Semaine -${i}`, weekStart, refEnd);
        refEnd = new Date(weekStart);
      }
    }
  
    // Cas 3 : période d’environ 1 mois
    else if (diffDays >= 28 && diffDays <= 31) {
      let refEnd = new Date(start);
      for (let i = 1; i <= 4; i++) {
        const monthStart = new Date(refEnd);
        monthStart.setMonth(refEnd.getMonth() - 1);
        pushInterval(`Mois -${i}`, monthStart, refEnd);
        refEnd = new Date(monthStart);
      }
    }
  
    // Cas 4 : période d’environ 6 mois
    else if (diffDays > 31 && diffDays <= 183) {
      let refEnd = new Date(start);
      for (let i = 1; i <= 2; i++) {
        const semStart = new Date(refEnd);
        semStart.setMonth(refEnd.getMonth() - 6);
        pushInterval(`Semestre -${i}`, semStart, refEnd);
        refEnd = new Date(semStart);
      }
    }
  
    // Cas 5 : période d’environ 1 an
    else {
      const yearEnd = new Date(start);
      const yearStart = new Date(start);
      yearStart.setFullYear(yearStart.getFullYear() - 1);
      pushInterval(`Année précédente`, yearStart, yearEnd);
    }
  
    return result;
  };
  
  

  export const getTraficMoyenByZone = async (idZone, date_debut, date_fin) => {
    try {
      if (!idZone) {
        throw new Error("Le paramètre idZone est obligatoire");
      }
  
      const start = new Date(date_debut);
      const end = new Date(date_fin);
  
      // 1. Nombre de visiteurs sur la période courante
      const visitesActuelles = await ZoneVisites.sum('nb_visiteurs', {
        where: {
          zone_id: idZone,
          date_visite: {
            [Op.gte]: start,
            [Op.lte]: end,
          },
        },
      });
      
  
      // 2. Récupérer les périodes passées
      const pastPeriods = getPastPeriods(date_debut, date_fin);
  
      // 3. Compter les visites sur chaque période passée
      let totalPastVisits = 0;
for (const period of pastPeriods) {
  const sumPast = await ZoneVisites.sum('nb_visiteurs', {
    where: {
      zone_id: idZone,
      date_visite: {
        [Op.gte]: period.date_debut,
        [Op.lte]: period.date_fin,
      },
    },
  });
  totalPastVisits += sumPast || 0; 
}

  
      const moyennePast = pastPeriods.length > 0 ? totalPastVisits / pastPeriods.length : 0;
  
      // 4. Calcul de la variation lissée (%)
      let variation = 0;
        if (moyennePast > 0) {
        variation = (visitesActuelles / moyennePast) * 100;
        }

      // 5. Calcul de la difference variation lissée (%)
      let diffVariation = 0;
        if (moyennePast > 0) {
        diffVariation = ((visitesActuelles - moyennePast) / moyennePast) * 100;
        }

        const diffVariationStr = diffVariation > 0 ? `+${diffVariation.toFixed(2)}` : diffVariation.toFixed(2);
      
      return {
        idZone,
        periode: { date_debut, date_fin },
        visitesActuelles,
        moyennePast,
        variation: parseFloat(variation.toFixed(2)), // arrondi 2 décimales
        diffVariation: diffVariationStr,
      };
    } catch (error) {
      console.error("Erreur dans getTraficMoyenByZone:", error);
      throw error;
    }
  };