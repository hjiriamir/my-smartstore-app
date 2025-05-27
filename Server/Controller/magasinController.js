import { createmagasin } from '../Model/magasin.js';



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