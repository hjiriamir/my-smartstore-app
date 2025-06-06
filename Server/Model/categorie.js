import db from '../Config/database.js';

export const createcategorie = (categorie , callback) => {
    const {categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification  } = categorie ; 
    
    const sql = "INSERT INTO categorie   (categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation,date_modification], callback); 
};

export const createcategories = (categories, callback) => {
    // Extraire tous les categorie_id à insérer
    const allIds = categories.map(c => c.categorie_id);
    const checkSql = "SELECT categorie_id FROM categorie WHERE categorie_id IN (?)";

    db.query(checkSql, [allIds], (err, existingRows) => {
        if (err) {
            callback(err);
            return;
        }

        // Extraire les IDs déjà présents dans la table
        const existingIds = existingRows.map(row => row.categorie_id);

        // Filtrer pour ne garder que les nouvelles catégories
        const newCategories = categories.filter(c => !existingIds.includes(c.categorie_id));

        if (newCategories.length === 0) {
            // Aucun nouvel enregistrement à insérer
            callback(null, { message: "Aucune nouvelle catégorie à insérer." });
            return;
        }

        // Requêtes d'insertion
        const sql = "INSERT INTO categorie (categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation, date_modification) VALUES ?";
        const values = newCategories.map(categorie => [
            categorie.categorie_id,
            categorie.nom,
            categorie.parent_id,
            categorie.niveau,
            categorie.saisonnalite,
            categorie.priorite,
            categorie.zone_exposition_preferee,
            categorie.temperature_exposition,
            categorie.conditionnement,
            categorie.clientele_ciblee,
            categorie.magasin_id,
            categorie.date_creation,
            categorie.date_modification
        ]);

        db.query(sql, [values], (err, results) => {
            if (err) {
                callback(err);
            } else {
                callback(null, results);
            }
        });
    });
};
export const getAllCategories = (callback) => {
    const sql = "SELECT * FROM categorie";
    db.query(sql, callback);
};

/*export const updateCategorie = (categorie, callback) => {
    const { id, categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation, date_modification } = categorie;

    const sql = `
        UPDATE categorie
        SET 
            categorie_id = ?,
            nom = ?, 
            parent_id = ?, 
            niveau = ?, 
            saisonnalite = ?, 
            priorite = ?, 
            zone_exposition_preferee = ?, 
            temperature_exposition = ?,
            conditionnement = ?,
            clientele_ciblee = ?,
            magasin_id = ?,
            date_creation = ?, 
            date_modification = ?
        WHERE id = ?
    `;

    db.query(sql, [categorie_id , nom , parent_id , niveau , saisonnalite , priorite , zone_exposition_preferee, temperature_exposition, conditionnement, clientele_ciblee, magasin_id, date_creation, date_modification, id], callback);
};*/
export const updateCategorie = (id, fieldsToUpdate, callback) => {
    // Extraire les colonnes et les valeurs à mettre à jour
    const columns = Object.keys(fieldsToUpdate);
    const values = Object.values(fieldsToUpdate);

    // Construire dynamiquement la clause SET
    const setClause = columns.map(column => `${column} = ?`).join(', ');

    const sql = `UPDATE categorie SET ${setClause} WHERE id = ?`;

    // Ajoute l'id à la fin du tableau des valeurs
    const params = [...values, id];

    db.query(sql, params, callback);
};