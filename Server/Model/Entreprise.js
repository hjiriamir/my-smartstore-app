import db from '../Config/database.js';

export const createEntreprise = (Entreprise, callback) => {
    const { nomEntreprise, adresse, informations_abonnement, date_creation } = Entreprise;
    const sql = "INSERT INTO Entreprise (nomEntreprise, adresse, informations_abonnement, date_creation) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [nomEntreprise, adresse, informations_abonnement, date_creation], (err, result) => {
        if (err) {
            return callback(err, null);
        }
        // Retourner l'ID de l'entreprise créée
        return callback(null, result.insertId);
    });
};

export const findEntrepriseById = (entreprise_id, callback) => {
    // On suppose qu'il existe une table `Entreprise` qui contient un champ `nomEntreprise`
    const sql = `
        SELECT e.nomEntreprise
        FROM Utilisateur u
        JOIN Entreprise e ON u.entreprise_id = e.idEntreprise
        WHERE u.entreprise_id = ?
    `;
    db.query(sql, [entreprise_id], (err, data) => {
        if (err) return callback(err);

        // Vérifier si des résultats ont été trouvés
        if (data.length > 0) {
            console.log(data[0]);
            callback(null, data[0]); // Retourne le premier résultat qui devrait être l'entreprise correspondante
        } else {
            callback(new Error("Entreprise non trouvée pour cet ID"));
        }
    });
};
