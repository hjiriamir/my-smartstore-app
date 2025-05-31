import { createzone, createzones, getAllZones, updateZone } from '../Model/zone.js';



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
export const getAllZonesController = (req, res) => {
    getAllZones((err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des zones :", err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des zones' });
        }
        res.status(200).json(results);
    });
};

/*export const updateZoneController = (req, res) => {
    const id = req.params.id; 
    const zone = req.body;
    zone.id = id; 

    updateZone(zone, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du zone :", err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour du zone" });
        }

        res.status(200).json({ message: "Zone mis à jour avec succès", result });
    });
};*/

export const updateZoneController = (req, res) => {
    const id = req.params.id; 
    const fieldsToUpdate = req.body;

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    updateZone(id, fieldsToUpdate, (err, result) => {
        if (err) {
            console.error("Erreur lors de la mise à jour du zone :", err);
            return res.status(500).json({ error: "Erreur lors de la mise à jour du zone" });
        }

        res.status(200).json({ message: "Zone mis à jour avec succès", result });
    });
};