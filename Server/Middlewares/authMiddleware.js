import jwt from 'jsonwebtoken';

// Dans le fichier authMiddleware.js
export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ Error: "Token manquant" });
    }

    jwt.verify(token, "jwt-secret_key", (err, decoded) => {
        if (err) {
            console.log("Contenu décodé du token:", decoded); // Déplacer avant le return
            return res.status(403).json({ Error: "Token invalide" });
        }
    
        req.user = {
            idUtilisateur: decoded.idUtilisateur,
            name: decoded.name,
            role: decoded.role,
            entreprises_id: decoded.entreprises_id // Même nom que dans le token
        };
    
        console.log("Middleware - User attaché:", req.user);
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

