import { createContext, useState, useEffect } from "react";
import { getMe } from "../services/authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getMe();
                setUser(data.user); // Stocker les infos de l'utilisateur
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        // Vérification du token avant d'appeler l'API
        if (localStorage.getItem("token")) {
            fetchUser();
        } else {
            setLoading(false); // Si pas de token, on passe directement à l'état non chargé
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
