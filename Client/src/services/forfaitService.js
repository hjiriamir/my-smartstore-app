import axios from "axios";

const API_URL = "http://localhost:8081/api/demande";

const ForfaitService = {
  async createDemande(data) {
    try {
      const response = await axios.post(`${API_URL}/createDemande`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      throw error; // Propager l'erreur pour qu'elle soit gérée dans le composant
    }
  },
};

export default ForfaitService;
