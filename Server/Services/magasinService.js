import magasin1 from "../Model/magasin1.js";
import {getProduitsByCategorie} from './produitService.js'
import Categorie1 from "../Model/Categorie1.js";
import Vente from "../Model/Ventes.js";
import Produit from "../Model/Produit.js";
import { Op } from 'sequelize';

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
