import db from '../Config/database.js';

export const createmagasin = (magasin , callback) => {
    const { magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification  } = magasin ; 
    
    const sql = "INSERT INTO magasin   (magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [magasin_id , nom_magasin , surface , longueur , largeur , zones_configurees , adresse, date_creation, date_modification], callback); 
};

export const createmagasins = (magasins, callback) => {
    const sql = "INSERT INTO magasin (magasin_id, nom_magasin, surface, longueur, largeur, zones_configurees, adresse, date_creation, date_modification) VALUES ?";    
    const values = magasins.map(magasin => [
        magasin.magasin_id,
        magasin.nom_magasin,
        magasin.surface,
        magasin.longueur,
        magasin.largeur,
        magasin.zones_configurees,
        magasin.adresse,
        magasin.date_creation,
        magasin.date_modification
    ]);
    
    db.query(sql, [values], callback);
};

export const getAllMagasin = (callback) => {
    const sql = "SELECT * FROM magasin";
    db.query(sql, callback);
};

export const updateMagasin = (id, fieldsToUpdate, callback) => {
    // Extraire les colonnes et les valeurs à mettre à jour
    const columns = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);

    // Construire dynamiquement la clause SET
    const setClause = columns.map(column => `${column} = ?`).join(', ');

    const sql = `UPDATE magasin SET ${setClause} WHERE id = ?`;

    // Ajoute l'id à la fin du tableau des valeurs
    const params = [...values, id];

    db.query(sql, params, callback);
};
