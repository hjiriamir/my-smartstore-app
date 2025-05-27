import db from '../Config/database.js';

export const createmagasin = (magasin , callback) => {
    const { magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification  } = magasin ; 
    
    const sql = "INSERT INTO magasin   (magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification], callback); 
};