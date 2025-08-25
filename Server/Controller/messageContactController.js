import contactMessage1 from '../Model/contactMessage1.js';
import { sendGenericMail } from '../Services/SendEmail.js';
import { mettreStatusRead, mettreStatusRepondus } from '../Services/contactMessageService.js';
// Créer un nouveau message de contact
export const createContactMessage = async (req, res) => {
    try {
        const message = await contactMessage1.create(req.body);
        res.status(201).json(message);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtenir la liste de tous les messages de contact
export const getAllContactMessages = async (req, res) => {
    try {
        const messages = await contactMessage1.findAll();
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtenir un message de contact par son ID
export const getContactMessageById = async (req, res) => {
    try {
        const message = await contactMessage1.findByPk(req.params.id);
        if (message) {
            res.json(message);
        } else {
            res.status(404).json({ message: 'Message non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Supprimer un message de contact par son ID
export const deleteContactMessage = async (req, res) => {
    try {
        const message = await contactMessage1.findByPk(req.params.id);
        if (message) {
            await message.destroy();
            res.json({ message: 'Message supprimé' });
        } else {
            res.status(404).json({ message: 'Message non trouvé' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const envoyerEmail = async (req, res) => {
    const { emetteur, recepteur, objet, contenuHtml } = req.body;
  
    try {
      // Validation minimale
      if (!recepteur || !objet || !contenuHtml) {
        return res.status(400).json({ message: 'Les champs recepteur, objet et contenuHtml sont obligatoires.' });
      }
  
      const info = await sendGenericMail(emetteur, recepteur, objet, contenuHtml);
  
      return res.status(200).json({ message: 'Email envoyé avec succès.', info });
    } catch (error) {
      console.error("Erreur dans envoyerEmail:", error);
      return res.status(500).json({ message: "Erreur lors de l'envoi de l'email.", error: error.message });
    }
  };


  export const marquerCommeLu = async (req, res) => {
    const { idMessage } = req.params;
  
    try {
      await mettreStatusRead(idMessage);
      res.status(200).json({ message: "Le message a été marqué comme lu." });
    } catch (error) {
      console.error("Erreur dans marquerCommeLu:", error);
      res.status(500).json({ error: error.message });
    }
  };
  
  export const marquerCommeRepondu = async (req, res) => {
    const { idMessage } = req.params;
  
    try {
      await mettreStatusRepondus(idMessage);
      res.status(200).json({ message: "Le message a été marqué comme répondu." });
    } catch (error) {
      console.error("Erreur dans marquerCommeRepondu:", error);
      res.status(500).json({ error: error.message });
    }
  };