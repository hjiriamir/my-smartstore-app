import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {createUser,findUserByEmail, getUserById} from './usersController.js'
import transporter from '../Config/transporter.js'
import db from '../Config/database.js';
import Users from '../Model/Users.js';
// Charger les variables d'environnement
dotenv.config();
const saltRounds = 10;

export const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ Error: "You are not authenticated" });
    } else {
        jwt.verify(token, "jwt-secret_key", (err, decoded) => {
            if (err) {
                return res.status(403).json({ Error: "Token is not correct" });
            } else {
                req.name = decoded.name;  // Récupère le nom de l'utilisateur à partir du token
                next();
            }
        });
    }
};


export const register = (req, res) => {
    const { name, email, password } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ Error: "Erreur de hachage du mot de passe" });

        createUser({ name, email, password: hash }, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'inscription" });
            }
            return res.json({ status: "Success" });
        });
    });
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ 
            where: { email } ,
            raw: true 
        });

        if (!user) return res.status(401).json({ Error: "Email incorrect" });
        // Debug: Vérifiez la valeur avant création du token
        console.log("Données user avant token:", {
            id: user.id,
            entreprises_id: user.entreprises_id // ← Vérifiez cette valeur
        });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ Error: "Mot de passe incorrect" });

        // ⚠️ Correction cruciale ici :
        console.log("User object before token creation:", {
            id: user.id,
            name: user.name,
            role: user.role,
            entreprises_id: user.entreprises_id
        });
        
        const tokenPayload = {
            idUtilisateur: user.id,
            name: user.name,
            role: user.role,
            entreprises_id: user.entreprises_id
        };
        console.log("Token payload:", tokenPayload);
        
        const token = jwt.sign(
            tokenPayload, 
            "jwt-secret_key",
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true });
        return res.json({
            status: "Success",
            role: user.role,
            name: user.name
        });
    } catch (err) {
        console.error("Erreur login:", err);
        res.status(500).json({ Error: "Erreur serveur" });
    }
};
  
/*export const login = (req, res) => {
    const { email, password } = req.body;

    findUserByEmail(email, (err, data) => {
        if (err) {
            console.error("Erreur de recherche utilisateur :", err);
            return res.status(500).json({ Error: "Erreur de connexion" });
        }
        if (data.length === 0) {
            return res.status(401).json({ Error: "Email incorrect" });
        }

        const user = data[0];
        bcrypt.compare(password, user.password, (err, response) => {
            if (err) return res.status(500).json({ Error: "Erreur de vérification du mot de passe" });
            if (!response) return res.status(401).json({ Error: "Mot de passe incorrect" });

            const token = jwt.sign(
                { idUtilisateur: user.idUtilisateur, name: user.name, role: user.role }, // Ajoutez l'ID ici
                "jwt-secret_key",
                { expiresIn: '1d' }
            );
             // Envoyer le token dans un cookie
             res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/' // Assurez-vous que le cookie est accessible depuis toutes les routes
            });

            return res.json({ status: "Success", role: user.role , name: user.name , entreprise_id: user.entreprise_id });
        });
    });
};*/

export const logout = (req, res) => {
    res.clearCookie('token');
    return res.json({ Status: "Success" });
};

export const getMe = async (req, res) => {
    try {
        // ⚠️ Vérification renforcée
        if (!req.user || !req.user.idUtilisateur) {
            console.error("Erreur: req.user non défini", req.user);
            return res.status(400).json({ Error: "Données utilisateur manquantes" });
        }

        console.log("Données reçues dans getMe:", {
            userId: req.user.idUtilisateur,
            fullUser: req.user
        });

        const user = await Users.findByPk(req.user.idUtilisateur, {
            attributes: { 
                exclude: ['password']
            }
        });
        console.log("User brut de la base:", user.get({ plain: true }));

        if (!user) {
            return res.status(404).json({ Error: "Utilisateur non trouvé" });
        }

        res.json({
            status: "Success",
            user: {
                idUtilisateur: user.id,
                name: user.name,
                role: user.role,
                entreprises_id: user.entreprises_id 
            }
        });

    } catch (err) {
        console.error("Erreur dans getMe:", err);
        res.status(500).json({ Error: "Erreur serveur" });
    }
};

export const forgotPassword = (req, res) => {
    const { email } = req.body;

    findUserByEmail(email, (err, data) => {
        if (err) {
            console.error("Erreur de recherche utilisateur :", err);
            return res.status(500).json({ Error: "Erreur lors de la demande de réinitialisation" });
        }
        if (data.length === 0) {
            return res.status(404).json({ Error: "Utilisateur non trouvé" });
        }

        const user = data[0];

        // Générez un token de réinitialisation avec expiration d'1 heure
        const token = jwt.sign({ id: user.idUtilisateur }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Mettez à jour l'utilisateur avec le token et la date d'expiration
        const updateQuery = 'UPDATE utilisateur SET resetPasswordToken = ?, resetPasswordExpires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE idUtilisateur = ?';
        db.query(updateQuery, [token, user.idUtilisateur], (err, result) => {
            if (err) {
                console.error("Erreur lors de la mise à jour de l'utilisateur :", err);
                return res.status(500).json({ Error: "Erreur lors de la demande de réinitialisation" });
            }

            // Envoyez l'email avec le lien de réinitialisation
            const resetUrl = `http://localhost:3000/reset-password/${token}`;
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Réinitialisation de votre mot de passe',
                text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetUrl}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Erreur lors de l'envoi de l'email :", err);
                    return res.status(500).json({ Error: "Erreur lors de l'envoi de l'email" });
                }
                res.status(200).json({ status: "Success", message: "Email de réinitialisation envoyé" });
            });
        });
    });
};


export const resetPassword = (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    // Vérifiez si le token est valide et non expiré
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({ Error: "Token invalide ou expiré" });
        }

        const userId = decoded.id;

        // Vérifiez si le token correspond à l'utilisateur et n'est pas expiré
        const query = 'SELECT * FROM utilisateur WHERE idUtilisateur = ? AND resetPasswordToken = ? AND resetPasswordExpires > NOW()';
        db.query(query, [userId, token], (err, data) => {
            if (err) {
                console.error("Erreur lors de la vérification du token :", err);
                return res.status(500).json({ Error: "Erreur lors de la réinitialisation du mot de passe" });
            }
            if (data.length === 0) {
                return res.status(400).json({ Error: "Token invalide ou expiré" });
            }

            // Hachez le nouveau mot de passe
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) {
                    console.error("Erreur lors du hachage du mot de passe :", err);
                    return res.status(500).json({ Error: "Erreur lors de la réinitialisation du mot de passe" });
                }

                // Mettez à jour le mot de passe et effacez le token
                const updateQuery = 'UPDATE utilisateur SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE idUtilisateur = ?';
                db.query(updateQuery, [hash, userId], (err, result) => {
                    if (err) {
                        console.error("Erreur lors de la mise à jour du mot de passe :", err);
                        return res.status(500).json({ Error: "Erreur lors de la réinitialisation du mot de passe" });
                    }
                    res.status(200).json({ status: "Success", message: "Mot de passe réinitialisé avec succès" });
                });
            });
        });
    });
};