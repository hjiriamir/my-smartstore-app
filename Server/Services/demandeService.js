import DemandeAbonnement from "../Model/demandeAbonnement.js";

export const updateStatusAbonnement = async (idDemande) => {
    const demande = await DemandeAbonnement.findOne(idDemande)
  
    if (!demande) {
      throw new Error("Demande non trouvée");
    }
  
    if (demande.status !== "En attente") {
      throw new Error("La demande n'est pas en attente");
    }
  
    demande.status = "Accepter";
    await demande.save();
  
    return {
      message: "Statut mis à jour avec succès",
      newStatus: demande.status
    };
  };
  