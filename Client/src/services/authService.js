import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// Définir l'URL de base de ton backend
const API_URL = `${API_BASE_URL}/auth`;
axios.defaults.withCredentials = true;

// Connexion utilisateur
export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password }, { withCredentials: true });
        return response.data; // Retourne les données reçues du backend
    } catch (error) {
        throw error.response ? error.response.data : { Error: "Erreur de connexion" };
    }
};

// Récupérer l'utilisateur connecté
export const getMe = async () => {
    try {
        const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { Error: "Erreur lors de la récupération de l'utilisateur" };
    }
};

// Déconnexion utilisateur
export const logout = async () => {
    try {
        const response = await axios.get(`${API_URL}/logout`, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error.response ? error.response.data : { Error: "Erreur de déconnexion" };
    }
};

// Fonction d'inscription
export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;  // Retourner les données de réponse
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        throw error;  // Propager l'erreur pour gestion dans le composant
    }
};