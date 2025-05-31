import { createcategorie, createcategories, getAllCategories, updateCategorie } from '../Model/categorie.js';



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

export const getAllCategoriesController = (req, res) => {
    getAllCategories((err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des catégories :", err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
        }
        res.status(200).json(results);
    });
};

/*export const updateCategorieController = (req, res) => {
    const id = req.params.id; 
    const categorie = req.body;
    categorie.id = id; 

    updateCategorie(categorie, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du categorie :", err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour du categorie" });
        }

        res.status(200).json({ message: "Categorie mis à jour avec succès", result });
    });
};*/
export const updateCategorieController = (req, res) => {
    const id = req.params.id; 
    const fieldsToUpdate = req.body;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    updateCategorie(id, fieldsToUpdate, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du magasin :", err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour du catégorie" });
        }

        res.status(200).json({ message: "Catégorie mis à jour avec succès", result });
    });
};