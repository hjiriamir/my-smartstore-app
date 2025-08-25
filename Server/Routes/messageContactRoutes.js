import express from 'express';
import { createContactMessage, 
        getAllContactMessages, 
        getContactMessageById, 
        deleteContactMessage, 
        envoyerEmail,
        marquerCommeLu, 
        marquerCommeRepondu  } from '../Controller/messageContactController.js';

const router = express.Router();

// Créer un message
router.post('/createMessage', createContactMessage);

// Liste des messages
router.get('/contact-messages', getAllContactMessages);

// Obtenir un message par ID
router.get('/contact-messages/:id', getContactMessageById);

// Supprimer un message par ID
router.delete('/contact-messages/:id', deleteContactMessage);

router.post('/envoyer-email', envoyerEmail);
router.put('/messagesLire/:idMessage', marquerCommeLu);
router.put('/messagesRepondre/:idMessage', marquerCommeRepondu);

export default router;
