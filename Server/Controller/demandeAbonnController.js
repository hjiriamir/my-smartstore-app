import { createDemande, retrieveQueries,updateStatusAbonnement } from '../Model/demandeAbonn.js';


export const createDemandeAbonn = (req, res) => {
    const { nom, prenom, entreprise, email,telephone,commentaire,titre_post,prix_abonnement,date_debut,date_fin,forfait } = req.body;


    createDemande({ nom, prenom, entreprise, email,telephone,commentaire,titre_post ,prix_abonnement,date_debut,date_fin,forfait}, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'inscription" });
            }
            return res.json({ status: "Success demande ajoutée" });
        });
    
};

// Méthode pour récupérer toutes les demandes d'abonnement
export const getAllDemandes = (req, res) => {
    retrieveQueries((err, data) => {
        if (err) {
            // Si une erreur survient lors de la récupération des demandes
            console.error("Erreur lors de la récupération des demandes d'abonnement :", err);
            return res.status(500).json({ error: "Erreur lors de la récupération des demandes" });
        }

        // Si tout se passe bien, renvoyer les données au client
        return res.status(200).json({
            status: "Success",
            demandes: data  // Les données des demandes sont renvoyées ici
        });
    });
};

export const handleAcceptDemande = (req, res) => {
    const idDemande = req.params.id; // Récupérer l'ID depuis l'URL

    updateStatusAbonnement(idDemande, (err, result) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        return res.json(result);
    });
};



