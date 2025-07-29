
import Produit from "../Model/Produit.js";

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
