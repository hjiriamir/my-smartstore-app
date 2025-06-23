import express from 'express';
import { getActiveSessions, logoutSession } from '../Controller/sessionController.js';
import {verifyToken}  from '../Middlewares/authMiddleware.js'; 

const router = express.Router();

// Middleware d'auth sur toutes les routes de session
router.use(verifyToken );

// Récupérer les sessions actives de l'utilisateur
router.get('/getActiveSessions', getActiveSessions);

// Déconnecter une session spécifique
router.delete('/logoutSession/:sessionId', logoutSession);

export default router;
