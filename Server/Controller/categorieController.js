import { createcategorie } from '../Model/categorie.js';



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