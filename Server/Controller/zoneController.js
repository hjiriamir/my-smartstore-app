import { createzone } from '../Model/zone.js';



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