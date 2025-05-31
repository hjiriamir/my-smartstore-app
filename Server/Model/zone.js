import db from '../Config/database.js';

export const createzone = (zone , callback) => {
    const { zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification } = zone ; 
    
    const sql = "INSERT INTO zone   (zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification], callback); 
};
export const createzones = (zones, callback) => {
    const sql = "INSERT INTO zone (zone_id, nom_zone, magasin_id, description, emplacement, date_creation, date_modification) VALUES ?";
    
    const values = zones.map(zone => [
        zone.zone_id,
        zone.nom_zone,
        zone.magasin_id,
        zone.description,
        zone.emplacement,
        zone.date_creation,
        zone.date_modification
    ]);
    
    db.query(sql, [values], callback);
};

export const getAllZones = (callback) => {
    const sql = "SELECT * FROM zone";
    db.query(sql, callback);
};

/*export const updateZone = (zone, callback) => {
    const { id, zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification } = zone;

    const sql = `
        UPDATE zone
        SET 
            zone_id = ?,
            nom_zone = ?, 
            magasin_id = ?, 
            description = ?, 
            emplacement = ?, 
            date_creation = ?, 
            date_modification = ?
        WHERE id = ?
    `;

    db.query(sql, [zone_id , nom_zone , magasin_id , description , emplacement , date_creation , date_modification, id], callback);
};*/

export const updateZone = (id, fieldsToUpdate, callback) => {
    // Extraire les colonnes et les valeurs à mettre à jour
    const columns = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);

    // Construire dynamiquement la clause SET
    const setClause = columns.map(column => `${column} = ?`).join(', ');

    const sql = `UPDATE zone SET ${setClause} WHERE id = ?`;

    // Ajoute l'id à la fin du tableau des valeurs
    const params = [...values, id];
    db.query(sql, params, callback);
};