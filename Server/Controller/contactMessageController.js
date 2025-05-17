import { createMessage } from '../Model/contactMessage.js';



export const createNewMessage = (req, res) => {
    const {email , phone , company_name , message , name , address , created_at } = req.body;


    createMessage({ email , phone , company_name , message , name , address , created_at}, (err, result) => {
            if (err) {
                console.error("Erreur d'insertion dans la base de données :", err);
                return res.status(500).json({ Error: "Erreur lors de l'inscription" });
            }
            return res.json({ status: "Success messager envoyer" });
        });
    
};