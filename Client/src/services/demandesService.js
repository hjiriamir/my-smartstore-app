
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
//const API_URL = "http://localhost:8081/api";

export const fetchDemandes = async () => {
  const response = await fetch(`${API_URL}/demande/getAllDemandes`);
  if (!response.ok) throw new Error("Erreur lors de la récupération des demandes");
  return response.json();
};

export const createEntreprise = async (demande) => {
  const response = await fetch(`${API_URL}/demande/createEntreprice`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nomEntreprise: demande.entreprise,
      adresse: demande.adresse,
      informations_abonnement: demande.forfait,
      date_creation: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de l'entreprise");
  return response.json();
};

export const createAdminUser = async (demande, entrepriseId) => {
  const response = await fetch(`${API_URL}/auth/newUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${demande.nom} ${demande.prenom}`,
      email: demande.email,
      password: "defaultPassword",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      role: "admin",
      entreprise_id: entrepriseId,
    }),
  });
  if (!response.ok) throw new Error("Erreur lors de la création de l'utilisateur admin");
  return response.json();
};

export const sendEmail = async (demande) => {
  const response = await fetch(`${API_URL}/emails/send-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      toEmail: demande.email,
      userEmail: "hjiriamir2020@gmail.com",
      userPassword: "defaultPassword",
    }),
  });
  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'email");
  return response.json();
};

export const updateDemandeStatus = async (idDemande) => {
  const response = await fetch(`${API_URL}/demande/updateStatus/${idDemande}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error("Erreur lors de la mise à jour du statut de la demande");
  return response.json();
};
