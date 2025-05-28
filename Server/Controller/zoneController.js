import { createzone, createzones } from '../Model/zone.js';



export const createNewZone = (req, res) => {
    const {zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification } = req.body;


    createzone({ zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification}, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'ajout du zone" });
            }
            return res.json({ status: "Success zone ajoutée" });
        });
    
};

export const createNewZones = (req, res) => {
    const zones = req.body; // Ici, on suppose que req.body est un tableau d'objets zone

    if (!Array.isArray(zones) || zones.length === 0) {
        return res.status(400).json({ Error: "Aucune zone fournie ou format invalide" });
    }

    createzones(zones, (err, result) => {
        if (err) {
            console.error("Erreur d'insertion dans la base de données :", err);
            return res.status(500).json({ Error: "Erreur lors de l'ajout des zones" });
        }
        return res.json({ status: "Success zones ajoutées", result });
    });
};