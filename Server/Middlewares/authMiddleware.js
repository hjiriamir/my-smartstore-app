import jwt from 'jsonwebtoken';

// Dans le fichier authMiddleware.js
export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ Error: "Vous n'êtes pas authentifié" });
    }
    jwt.verify(token, "jwt-secret_key", (err, decoded) => {
        if (err) {
            return res.status(403).json({ Error: "Token invalide" });
        }
        req.user = { // Stockez toutes les informations de l'utilisateur dans req.user
            idUtilisateur: decoded.idUtilisateur,
            name: decoded.name,
            role: decoded.role,
        };
        next();
    });
};
export const verifyRole = (role) => {
    return (req, res, next) => {
        if (!req.role) {
            return res.status(403).json({ Error: "Rôle non défini" });
        }

        if (req.role !== role) {
            return res.status(403).json({ Error: "Accès refusé. Rôle insuffisant." });
        }

        next();
    };
};

