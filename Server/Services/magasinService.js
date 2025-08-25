import magasin1 from "../Model/magasin1.js";
import {getProduitsByCategorie} from './produitService.js'
import Categorie1 from "../Model/Categorie1.js";
import Vente from "../Model/Ventes.js";
import Produit from "../Model/Produit.js";
import { Op } from 'sequelize';
import Zone1 from "../Model/zone1.js";

export const getCategoriesByStore = async(idMagasin) => {
    try {
        if (!idMagasin) {
            throw new Error("Le paramètre idMagasin est obligatoire");
          }
    
    const categories = await Categorie1.findAll({
        where: {magasin_id: idMagasin}
    })
    
    return categories;
        
    } catch (error) {
        console.error("Erreur dans getCategoriesByStore:", error);
      throw error;
    }
}

export const getProduitsByStore = async(idMagasin) => {
    try {
        if (!idMagasin) {
            throw new Error("Le paramètre idMagasin est obligatoire");
        }
    
        // 1. Récupérer les catégories du magasin
        const categories = await getCategoriesByStore(idMagasin);
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
        console.error("Erreur dans getProduitsByStore:", error);
        throw error;
    }
}

export const getVenteTotalByMagasin = async (idMagasin, date_debut, date_fin) => {
    try {
        if (!idMagasin) {
            throw new Error("Le paramètre idMagasin est obligatoire");
        }

        // 1. Construire les conditions de filtre
        const where = {
            magasin_id: idMagasin, // Filtre direct par magasin_id
            date_vente: {}
        };

        if (date_debut) {
            where.date_vente[Op.gte] = new Date(date_debut);
        }

        if (date_fin) {
            where.date_vente[Op.lte] = new Date(date_fin);
        }

        // 2. Récupérer les ventes avec jointure sur Produit
        const ventes = await Vente.findAll({ 
            where,
            include: [{ 
                model: Produit, 
                as: 'produit', 
                attributes: ['nom', 'produit_id']
            }]
        });

        // 3. Calculer les totaux
        const result = ventes.reduce((acc, vente) => {
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
                    nom_produit: vente.produit?.nom, 
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
        
        return result;

    } catch (error) {
        console.error("Erreur dans getVenteTotalByMagasin:", error);
        throw error;
    }
}

export const getTotalMagasinByEntreprises = async (idEntreprise) => {
    try {
      if (!idEntreprise) throw new Error("Le paramètre idEntreprise est obligatoire");
  
     
      const { count: totalMagasins, rows: magasins } = await magasin1.findAndCountAll({
        where: { entreprise_id: idEntreprise },
        order: [["nom_magasin"]] 
      });
  
      return {
        totalMagasins,
        magasins 
      };
  
    } catch (error) {
      console.error("Erreur dans getTotalMagasinByEntreprises:", error);
      throw error;
    }
  };
  
  export const getTotalZonesByEntreprises = async (idEntreprise) => {
    try {
      if (!idEntreprise) throw new Error("Le paramètre idEntreprise est obligatoire");
  
      // Récupérer les IDs des magasins de l'entreprise
      const magasins = await magasin1.findAll({
        where: { entreprise_id: idEntreprise },
        attributes: ["magasin_id"] // récupérer uniquement la Clé unique
      });
  
      const magasinIds = magasins.map(m => m.magasin_id);
  
      // Si aucun magasin, aucun zone
      if (magasinIds.length === 0) return { totalZones: 0 };
  
      // Compter toutes les zones associées à ces magasins
      const { count: totalZones } = await Zone1.findAndCountAll({
        where: { magasin_id: { [Op.in]: magasinIds } }
      });
  
      return { totalZones };
  
    } catch (error) {
      console.error("Erreur dans getTotalZonesByEntreprises:", error);
      throw error;
    }
  };
export const getTotalSurfaceByEntreprises = async (idEntreprise) => {
    try {
      if (!idEntreprise) {
        throw new Error("Le paramètre idEntreprise est obligatoire");
      }
  
      // Récupérer tous les magasins de l'entreprise
      const magasins = await magasin1.findAll({
        where: { entreprise_id: idEntreprise },
        attributes: ["surface"] // on ne récupère que la surface
      });
  
      // Calculer la somme des surfaces
      const surfaceTotal = magasins.reduce((total, mag) => {
        return total + (parseFloat(mag.surface) || 0);
      }, 0);
  
      return surfaceTotal;
  
    } catch (error) {
      console.error("Erreur dans getTotalSurfaceByEntreprises:", error);
      throw error;
    }
  };

  export const getMagasinDetails = async (idMagasin) => {
    try {
      if (!idMagasin) throw new Error("Le paramètre idMagasin est obligatoire");
  
      // Récupérer le magasin avec tous ses attributs et ses zones associées
      const magasin = await magasin1.findOne({
        where: { magasin_id: idMagasin },
        include: [
          {
            model: Zone1,
            as: "zones", // alias défini dans l'association
            // Supprimer attributes pour récupérer tous les champs
            attributes: { exclude: [] } 
          }
        ]
      });
  
      if (!magasin) {
        throw new Error("Magasin introuvable");
      }
  
      return magasin;
  
    } catch (error) {
      console.error("Erreur dans getMagasinDetails:", error);
      throw error;
    }
  };