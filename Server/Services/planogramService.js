
import Furniture from "../Model/Furniture.js";
import ProductPosition from "../Model/ProductPosition.js";
import Produit from "../Model/Produit.js";
import ZoneVisites from "../Model/ZoneVisites.js";
import Vente from "../Model/Ventes.js";
import { Op, fn, col } from "sequelize";

export const getProductsPerFurniture = async (idFurniture) => {
  try {
    if (!idFurniture) {
      throw new Error("idFurniture obligatoire");
    }

    const produitsPos = await ProductPosition.findAll({
      where: { furniture_id: idFurniture }
    });

    const produitsIds = produitsPos.map(m => m.product_id);

    // Si aucun produit lié
    if (produitsIds.length === 0) return [];

    const produits = await Produit.findAll({
      where: {
        id: {
          [Op.in]: produitsIds
        }
      }
    });

    return produits; // Retourne simplement le tableau
  } catch (error) {
    console.error("Erreur dans getProductsPerFurniture:", error);
    throw error; 
  }
};


export const getProductsPerPlanogram = async (idPlanogram) => {
    try {
      if (!idPlanogram) {
        throw new Error("idPlanogram obligatoire");
      }
  
      // Étape 1 : Récupérer toutes les furnitures associées au planogram
      const furnitures = await Furniture.findAll({
        where: { planogram_id: idPlanogram }
      });
  
      const furnituresIds = furnitures.map(m => m.furniture_id);
  
      if (furnituresIds.length === 0) return [];
  
      // Étape 2 : Appeler getProductsPerFurniture pour chaque furniture
      const allProductsArrays = await Promise.all(
        furnituresIds.map(id => getProductsPerFurniture(id))
      );
  
      // Étape 3 : Fusionner et supprimer les doublons
      const allProducts = allProductsArrays.flat();
  
      // Supprimer les doublons par ID produit
      const uniqueProducts = Array.from(
        new Map(allProducts.map(prod => [prod.id, prod])).values()
      );
  
      return uniqueProducts;
    } catch (error) {
      console.error("Erreur dans getProductsPerPlanogram:", error);
      throw error;
    }
};
  
  
  export const getVisiteursParZone = async (idZone, date_debut, date_fin) => {
    try {
      if (!idZone) {
        throw new Error("Le paramètre idZone est obligatoire");
      }
  
      const startDate = date_debut ? new Date(date_debut) : null;
      const endDate = date_fin ? new Date(date_fin) : null;
  
      if (date_debut && isNaN(startDate.getTime())) {
        throw new Error("Format de date_debut invalide. Utilisez YYYY-MM-DD");
      }
  
      if (date_fin && isNaN(endDate.getTime())) {
        throw new Error("Format de date_fin invalide. Utilisez YYYY-MM-DD");
      }
  
      if (startDate && endDate && startDate > endDate) {
        throw new Error("date_debut ne peut pas être postérieure à date_fin");
      }
  
      // Construire les conditions
      const where = { zone_id: idZone };
      if (startDate || endDate) {
        where.date_visite = {};
        if (startDate) where.date_visite[Op.gte] = startDate;
        if (endDate) where.date_visite[Op.lte] = endDate;
      }
  
      // Faire la somme du champ nb_visiteurs
      const result = await ZoneVisites.findOne({
        where,
        attributes: [
          [fn("SUM", col("nb_visiteurs")), "total_visiteurs"]
        ],
        raw: true
      });
  
      // Retourner 0 si aucun résultat
      return result.total_visiteurs ? parseInt(result.total_visiteurs, 10) : 0;
  
    } catch (error) {
      console.error("Erreur dans getVisiteursParZone:", error);
      throw error;
    }
  };
  
  export const getVenteProduitsPerPlanogram = async (idPlanogram, date_debut, date_fin) => {
    try {
      // Vérification des paramètres
      if (!idPlanogram) {
        throw new Error("idPlanogram obligatoire");
      }
  
      const startDate = date_debut ? new Date(date_debut) : null;
      const endDate = date_fin ? new Date(date_fin) : null;
  
      if (date_debut && isNaN(startDate.getTime())) {
        throw new Error("Format de date_debut invalide. Utilisez YYYY-MM-DD");
      }
  
      if (date_fin && isNaN(endDate.getTime())) {
        throw new Error("Format de date_fin invalide. Utilisez YYYY-MM-DD");
      }
  
      // 1. Récupérer tous les produits du planogramme
      const produits = await getProductsPerPlanogram(idPlanogram);
      const produitsIds = produits.map(p => p.produit_id);
  
      if (produitsIds.length === 0) return [];
  
      // 2. Construire la clause where pour les ventes
      const where = {
        produit_id: { [Op.in]: produitsIds }
      };
  
      if (startDate || endDate) {
        where.date_vente = {};
        if (startDate) where.date_vente[Op.gte] = startDate;
        if (endDate) where.date_vente[Op.lte] = endDate;
      }
  
      // 3. Chercher les ventes correspondantes
      const ventes = await Vente.findAll({ where });
  
      return ventes;
    } catch (error) {
      console.error("Erreur dans getVenteProduits:", error);
      throw error;
    }
  };

 