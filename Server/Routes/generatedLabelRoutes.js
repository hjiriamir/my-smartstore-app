import express from 'express';
import { createGeneratedLabel, getGeneratedLabels, updateLabelStatus, getDailyGeneratedTicket, generateTickets } from '../Controller/generatedLabelController.js';

const router = express.Router();

router.post('/createGeneratedLabel', createGeneratedLabel);       // Générer une étiquette
router.get('/getGeneratedLabels', getGeneratedLabels);          // Liste des étiquettes générées
router.patch('/updateLabelStatus/:id', updateLabelStatus); // Changer le statut (imprimé/en_attente)
router.post("/generate-tickets", generateTickets);
router.get('/getDailyGeneratedTicket/:idEntreprise', getDailyGeneratedTicket);

export default router;
