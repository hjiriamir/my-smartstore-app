import { sendMail, sendBasicEmail } from "../Services/SendEmail.js";

export const sendEmailController = async (req, res) => {
    const { toEmail, userEmail, userPassword } = req.body;

    if (!toEmail || !userEmail || !userPassword) {
        return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    try {
        await sendMail(toEmail, userEmail, userPassword);
        res.status(200).json({ message: `Email envoyé avec succès à ${toEmail} !` });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        res.status(500).json({ message: "Erreur lors de l'envoi de l'email.", error });
    }
};
//sendMailPersonal
export const sendBasicEmailController = async (req, res) => {
    const { senderEmail, receiverEmail } = req.body;

    if (!senderEmail || !receiverEmail) {
        return res.status(400).json({ 
            message: "Les emails de l'expéditeur et du destinataire sont obligatoires." 
        });
    }

    try {
        await sendBasicEmail(senderEmail, receiverEmail);
        res.status(200).json({ 
            message: `Notification envoyée de ${senderEmail} à ${receiverEmail} avec succès !` 
        });
    } catch (error) {
        console.error("Erreur d'envoi:", error);
        res.status(500).json({ 
            message: "Échec de l'envoi",
            error: error.message 
        });
    }
};