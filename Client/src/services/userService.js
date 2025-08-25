//const API_BASE_URL = "http://localhost:8081/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// 🔹 Récupérer toutes les demandes d'abonnement
export const fetchDemandes = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/demande/getAllDemandes`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des demandes");
        const data = await response.json();
        // Si l'API retourne un tableau directement
        return Array.isArray(data) ? data : [data];
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
        const response = await fetch(`${API_BASE_URL}/demande/updateDemandeStatus/${idDemande}`, {
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
        const response = await fetch(`${API_BASE_URL}/demande/getEntrepriseById/${entrepriseId}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération du nom de l'entreprise");
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
};
export const fetchUsers = async (entreprises_id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/users/excluding-admin/${entreprises_id}`);
        if (!response.ok) throw new Error("Erreur lors de la récupération des utilisateurs");
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
};

// 🔹 Refuser une demande
export const refuserDemande = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demande/refuserDemande/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors du refus de la demande: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  // 🔹 Accepter une demande (mise à jour du statut)
  export const accepterDemande = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/demande/accepterDemande/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur lors de l'acceptation de la demande: ${response.status} - ${errorText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };


  export const createEtatAbonnement = async (data) => {
    const response = await fetch(`${API_BASE_URL}/etat-abonnement/createEtatAbonnement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      throw new Error('Failed to create etat abonnement')
    }
    return response.json()
  }
  