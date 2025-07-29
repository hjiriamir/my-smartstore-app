import {getCategoriesByZone} from './categorieService.js'
import {getProduitsByCategorie} from './produitService.js'
import Vente from '../Model/Ventes.js';
import Produit from '../Model/Produit.js';
import { Op } from 'sequelize';
import Zone1 from '../Model/zone1.js';
import Categorie1 from '../Model/Categorie1.js';

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