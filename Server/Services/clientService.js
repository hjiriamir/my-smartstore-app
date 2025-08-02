import Client from "../Model/Client.js";
import GamificationParticipation from "../Model/GamificationParticipation.js";
import {Op} from 'sequelize'


export const getClientsTotalByEntreprise = async(idEntreprise) => {
    try {
        if (!idEntreprise) {
            throw new Error("Le paramètre idEntreprise est obligatoire");
        }
    
        // 1. Récupérer les clients d'entreprise
        const clients = await Client.findAll({
            where: {entreprise_id: idEntreprise}
        })
        
        return clients;
        
    } catch (error) {
        console.error("Erreur dans getClientTotalByEntreprise:", error);
        throw error;
    }
}

export const getClientsParticipantsByEntreprise = async (idEntreprise) => {
    try {
      if (!idEntreprise) {
        throw new Error("Le paramètre idEntreprise est obligatoire");
      }
  
      // 1. Récupérer les clients de l'entreprise
      const clients = await Client.findAll({
        where: { entreprise_id: idEntreprise },
      });
  
      const clientsIds = clients.map((c) => c.id);
  
      if (clientsIds.length === 0) {
        return {
          totalClients: 0,
          totalParticipants: 0,
          participantsDetails: [],
        };
      }
  
      // 2. Vérifier combien de ces clients apparaissent dans GamificationParticipation
      const participationClients = await GamificationParticipation.findAll({
        where: {
          client_id: {
            [Op.in]: clientsIds,
          },
        },
      });
  
      return {
        totalClients: clientsIds.length,
        totalParticipants: participationClients.length,
        participantsDetails: participationClients,
      };
    } catch (error) {
      console.error("Erreur dans getClientsParticipantsByEntreprise:", error);
      throw error;
    }
  };