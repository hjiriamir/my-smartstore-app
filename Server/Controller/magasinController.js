import { createmagasin, createmagasins } from '../Model/magasin.js';



export const createNewMagasin = (req, res) => {
    const {magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification } = req.body;


    createmagasin({ magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification}, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'ajout du magasin" });
            }
            return res.json({ status: "Success magasin ajoutée" });
        });
    
};

export const createNewMagasins = (req, res) => {
    const magasins = req.body; // Ici, on suppose que req.body est un tableau d'objets zone

    if (!Array.isArray(magasins) || magasins.length === 0) {
        return res.status(400).json({ Error: "Aucune magasin fournie ou format invalide" });
    }

    createmagasins(magasins, (err, result) => {
        if (err) {
            console.error("Erreur d'insertion dans la base de données :", err);
            return res.status(500).json({ Error: "Erreur lors de l'ajout des magasins" });
        }
        return res.json({ status: "Success magasins ajoutées", result });
    });
};