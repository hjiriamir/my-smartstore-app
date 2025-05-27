import db from '../Config/database.js';

export const createcategorie = (categorie , callback) => {
    const {categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification  } = categorie ; 
    
    const sql = "INSERT INTO categorie   (categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification], callback); 
};