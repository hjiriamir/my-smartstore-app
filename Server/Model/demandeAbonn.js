import db from '../Config/database.js';

export const createDemande = (demandeAbonn, callback) => {
    const { nom, prenom, entreprise, email, telephone, commentaire, titre_post, prix_abonnement, date_debut, date_fin, forfait, status } = demandeAbonn; 
    // Si le status n'est pas fourni, on lui attribue 'En attente' par défaut
    const statusValue = status || 'En attente'; 
    
    const sql = "INSERT INTO demande_abonnement (nom, prenom, entreprise, email, telephone, commentaire, titre_post, prix_abonnement, date_debut, date_fin, forfait, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [nom, prenom, entreprise, email, telephone, commentaire, titre_post, prix_abonnement, date_debut, date_fin, forfait, statusValue], callback); 
};


export const retrieveQueries = (callback) => {
    // Requête SQL pour récupérer toutes les demandes
    const sql = "SELECT * FROM demande_abonnement";

    // Exécution de la requête SQL
    db.query(sql, (err, data) => {
        if (err) {
            return callback(err);  // Gestion de l'erreur
        }
        console.log(data);  // Affichage des données dans la console
        callback(null, data);  // Retour des données au callback
    });
};
export const updateStatusAbonnement = (idDemande, callback) => {
    // Vérifier d'abord le statut actuel
    const sqlSelect = "SELECT status FROM demande_abonnement WHERE idDemande = ?";
    
    db.query(sqlSelect, [idDemande], (err, data) => {
        if (err) return callback(err);
        
        // Vérifier si une demande existe
        if (data.length === 0) {
            return callback(new Error("Demande non trouvée"));
        }

        // Vérifier si le statut est "En attente"
        const currentStatus = data[0].status;
        if (currentStatus !== "En attente") {
            return callback(new Error("La demande n'est pas en attente"));
        }

        // Mise à jour du statut vers "Acceptée"
        const sqlUpdate = "UPDATE demande_abonnement SET status = 'Acceptée' WHERE idDemande = ?";
        db.query(sqlUpdate, [idDemande], (err, result) => {
            if (err) return callback(err);
            
            callback(null, { message: "Statut mis à jour avec succès", newStatus: "Acceptée" });
        });
    });
};

