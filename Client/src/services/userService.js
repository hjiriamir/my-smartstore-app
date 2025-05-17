const API_BASE_URL = "http://localhost:8081/api";

// 🔹 Récupérer toutes les demandes d'abonnement
export const fetchDemandes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/demande/getAllDemandes`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des demandes");
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 🔹 Créer une entreprise
export const createEntreprise = async (entrepriseData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/demande/createEntreprice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(entrepriseData),
        });

        if (!response.ok) throw new Error("Erreur lors de la création de l'entreprise");

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 🔹 Créer un utilisateur admin
export const createUser = async (userData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/newUser`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });

        if (!response.ok) throw new Error("Erreur lors de la création de l'utilisateur");

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 🔹 Envoyer un email
export const sendEmail = async (emailData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/emails/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) throw new Error("Erreur lors de l'envoi de l'email");

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

// 🔹 Mettre à jour le statut de la demande
export const updateDemandeStatus = async (idDemande) => {
    try {
        const response = await fetch(`${API_BASE_URL}/demande/updateStatus/${idDemande}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut de la demande");

        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
export const fetchCompanyName = async (entrepriseId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/demande/entreprise/${entrepriseId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération du nom de l'entreprise");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};
export const fetchUsers = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/users/excluding-admin`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};