import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUserBySystem, getAllUsersExcludingAdmin} from '../Model/User.js';

const saltRounds = 10;

export const createNewUser = (req, res) => {
    const {  name, email, password, role, entreprise_id } = req.body;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.status(500).json({ Error: "Erreur de hachage du mot de passe" });
    createUserBySystem({  name, email, password :hash, role, entreprise_id }, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'inscription" });
            }
            return res.json({ status: "Success utilisateur système ajoutée " });
        });
    });
};


export const getUsersExcludingAdmin = (req, res) => {
    getAllUsersExcludingAdmin((err, users) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs", error: err });
        }
        return res.status(200).json(users);  // Retourne les utilisateurs récupérés
    });
};
