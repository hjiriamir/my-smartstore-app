import express from 'express';
import { createZoneVisite, getZoneVisites, getZoneStats } from '../Controller/zoneVisitesController.js';

const router = express.Router();

// Ajouter une visite
router.post('/createZoneVisite', createZoneVisite);

// Récupérer toutes les visites d'une zone
router.get('/getZoneVisites/:zoneId', getZoneVisites);

// Récupérer stats globales par zone
router.get('/getZoneStats', getZoneStats);

export default router;
