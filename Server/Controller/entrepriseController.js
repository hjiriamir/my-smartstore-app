import { createEntreprise, findEntrepriseById } from '../Model/Entreprise.js';

export const createNewEntreprise = (req, res) => {
    const { nomEntreprise, adresse, informations_abonnement, date_creation } = req.body;

    createEntreprise({ nomEntreprise, adresse, informations_abonnement, date_creation }, (err, entrepriseId) => {
        if (err) {
            console.error("Erreur d'insertion dans la base de données :", err);
            return res.status(500).json({ Error: "Erreur lors de l'inscription" });
        }
        // Retourner l'ID de l'entreprise créée
        return res.json({ status: "Success entreprise ajoutée", entrepriseId });
    });
};
export const getEntrepriseById = (req, res) => {
    const entrepriseId = req.params.entreprise_id; // Récupère l'ID de l'entreprise via les paramètres d'URL

    // Appeler la méthode findEntrepriseByIdUser avec l'ID de l'entreprise
    findEntrepriseById(entrepriseId, (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la récupération de l'entreprise", error: err.message });
        }

        if (data) {
            // Renvoie le nom de l'entreprise
            return res.status(200).json({ entrepriseName: data.nomEntreprise });
        } else {
            // Si l'entreprise n'a pas été trouvée
            return res.status(404).json({ message: "Entreprise non trouvée" });
        }
    });
};