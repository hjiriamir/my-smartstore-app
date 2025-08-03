import express from 'express';
import { createGeneratedLabel, getGeneratedLabels, updateLabelStatus } from '../Controller/generatedLabelController.js';

const router = express.Router();

router.post('/createGeneratedLabel', createGeneratedLabel);       // Générer une étiquette
router.get('/getGeneratedLabels', getGeneratedLabels);          // Liste des étiquettes générées
router.patch('/updateLabelStatus/:id', updateLabelStatus); // Changer le statut (imprimé/en_attente)

export default router;
