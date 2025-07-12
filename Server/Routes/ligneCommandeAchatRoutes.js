import express from 'express';
import { createLigneCommande, getLignesByCommande } from '../Controller/ligneCommandeAchatController.js';

const router = express.Router();

router.post('/createLigneCommande', createLigneCommande);
router.get('/commande/:id', getLignesByCommande);

export default router;
