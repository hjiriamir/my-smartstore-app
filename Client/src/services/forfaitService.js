import axios from "axios";

//const API_URL = "http://localhost:8081/api/demande";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const ForfaitService = {
  async createDemande(data) {
    try {
      const response = await axios.post(`${API_URL}/demande/createDemande`, data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      throw error; // Propager l'erreur pour qu'elle soit gérée dans le composant
    }
  },
};

export default ForfaitService;
