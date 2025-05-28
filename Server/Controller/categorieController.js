import { createcategorie, createcategories } from '../Model/categorie.js';



export const createNewCategorie = (req, res) => {
    const {categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification } = req.body;


    createcategorie({ categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification}, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'ajout du catégorie" });
            }
            return res.json({ status: "Success catégorie ajoutée" });
        });
    
};


export const createNewCategories = (req, res) => {
    const categories = req.body; // Ici, on suppose que req.body est un tableau d'objets zone

    if (!Array.isArray(categories) || categories.length === 0) {
        return res.status(400).json({ Error: "Aucune categorie fournie ou format invalide" });
    }

    createcategories(categories, (err, result) => {
        if (err) {
            console.error("Erreur d'insertion dans la base de données :", err);
            return res.status(500).json({ Error: "Erreur lors de l'ajout des categories" });
        }
        return res.json({ status: "Success categories ajoutées", result });
    });
};