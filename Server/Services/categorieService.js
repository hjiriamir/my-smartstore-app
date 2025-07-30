import Categorie1 from "../Model/Categorie1.js";
import { Op } from 'sequelize';

export const getCategoriesByZone = async(idZone, idMagasin) => {
    try {
        if (!idZone || !idMagasin) {
            throw new Error("Les paramètres idZone et idMagasin sont obligatoires");
        }
    
        const categories = await Categorie1.findAll({
            where: {
                [Op.and]: [
                    { zone_id: idZone },
                    { magasin_id: idMagasin }
                ]
            }
        });

        console.log(`Catégories pour zone ${idZone} et magasin ${idMagasin}:`, categories);
        return categories;
        
    } catch (error) {
        console.error("Erreur dans getCategoriesByZone:", error);
        throw error;
    }
}

export const getCategoriesByStore = async(idMagasin) => {
    try {
        if (!idMagasin) {
            throw new Error("Les paramètres idMagasin sont obligatoires");
        }
    
        const categories = await Categorie1.findAll({
            where: {
                magasin_id: idMagasin 
                
            }
        });

        console.log(`Catégories pour  magasin ${idMagasin}:`, categories);
        return categories;
        
    } catch (error) {
        console.error("Erreur dans getCategoriesByZone:", error);
        throw error;
    }
}
