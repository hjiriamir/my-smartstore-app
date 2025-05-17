import React, { useEffect, useState } from "react";
import "./DashboardEntreprise.css";
import Sidebar from "./Sidebar";
import { 
    fetchDemandes, 
    createEntreprise, 
    createUser, 
    sendEmail, 
    updateDemandeStatus 
} from "../../src/services/userService";

const ListeDemandes = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getDemandes = async () => {
            try {
                const data = await fetchDemandes();
                setDemandes(data.demandes);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        getDemandes();
    }, []);

    const handleAction = async (demande) => {
        try {
            // 1️⃣ Créer l'entreprise
            const entrepriseData = {
                nomEntreprise: demande.entreprise,
                adresse: demande.adresse,
                informations_abonnement: demande.forfait,
                date_creation: new Date().toISOString(),
            };

            const entrepriseResponse = await createEntreprise(entrepriseData);
            const entrepriseId = entrepriseResponse.entrepriseId;

            console.log("Entreprise créée avec l'ID:", entrepriseId);

            // 2️⃣ Créer l'utilisateur admin
            const userData = {
                name: `${demande.nom} ${demande.prenom}`,
                email: demande.email,
                password: "defaultPassword",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                role: "admin",
                entreprise_id: entrepriseId,
            };

            await createUser(userData);
            console.log("Utilisateur admin créé avec succès");

            // 3️⃣ Envoyer un email
            const emailData = {
                toEmail: demande.email,
                userEmail: demande.email,
                userPassword: "defaultPassword",
            };

            await sendEmail(emailData);
            console.log("✅ Email envoyé avec succès à :", demande.email);

            // 4️⃣ Mettre à jour le statut de la demande
            await updateDemandeStatus(demande.idDemande);
            console.log(`Statut de la demande ${demande.idDemande} mis à jour`);

            // ✅ Mise à jour de l'UI en supprimant la demande de la liste
            setDemandes(prevDemandes => prevDemandes.filter(d => d.idDemande !== demande.idDemande));

            alert(`Entreprise et utilisateur admin créés avec succès pour ${demande.nom} ${demande.prenom}`);
        } catch (err) {
            alert(`Erreur: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Chargement des données...</div>;
    }

    if (error) {
        return <div>Erreur: {error}</div>;
    }

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <h1>Liste des Demandes d'Abonnement</h1>
                <table className="demandes-table">
                    <thead>
                        <tr>
                            <th>Date Fin</th>
                            <th>Forfait</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {demandes.map((demande) => (
                            <tr key={demande.idDemande}>
                                <td>{demande.date_fin}</td>
                                <td>{demande.forfait}</td>
                                <td>
                                    <button 
                                        className="action-button" 
                                        onClick={() => handleAction(demande)}
                                    >
                                        Accept the request
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListeDemandes;
