"use client"; // Si tu es en mode App Router de Next.js 13+

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import './ResetPassword.css'; // Assurez-vous que le chemin est correct

const ResetPassword = () => {
    const [token, setToken] = useState("");
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        // Extrait le token de l'URL
        const pathArray = window.location.pathname.split("/");
        const extractedToken = pathArray[pathArray.length - 1];
        setToken(extractedToken);
        console.log("Extracted Token:", extractedToken);
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/reset-password/${token}`,
                { password }
            );

            if (response.data.status === "Success") {
                setSuccess("Mot de passe réinitialisé avec succès !");
            } else {
                setError(response.data.Error || "Une erreur est survenue.");
            }
        } catch (err) {
            console.error("Erreur détaillée:", err.response?.data || err.message);
            setError("Erreur de connexion au serveur.");
        }
    };

    const handleRedirectToLogin = () => {
        router.push("/LoginSignup");
    };

    return (
        <div className="reset-container">
            <h2>Réinitialisation du mot de passe</h2>
            {error && <p className="error">{error}</p>}
            {success ? (
                <div>
                    <p className="success">{success}</p>
                    <button onClick={handleRedirectToLogin} className="redirect-button">
                        Se connecter
                    </button>
                </div>
            ) : (
                <form onSubmit={handleResetPassword}>
                    <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirmez le mot de passe"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit">Réinitialiser</button>
                </form>
            )}
        </div>
    );
};

export default ResetPassword;