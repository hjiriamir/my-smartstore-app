import db from '../Config/database.js';

export const createzone = (zone , callback) => {
    const { zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification } = zone ; 
    
    const sql = "INSERT INTO zone   (zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification], callback); 
};