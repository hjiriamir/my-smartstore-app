import express from 'express';
import { createCommandeAchat, getAllCommandes } from '../Controller/commandeAchatController.js';

const router = express.Router();

router.post('/createCommandeAchat', createCommandeAchat);
router.get('/getAllCommandes', getAllCommandes);

export default router;
