import express from 'express';
import { createDemandeAbonn, getAllDemandes, handleAcceptDemande } from '../Controller/demandeAbonnController.js';


const demande_router = express.Router();

demande_router.post('/createDemande', createDemandeAbonn);
demande_router.get('/getAllDemandes', getAllDemandes);
demande_router.put('/updateStatus/:id', handleAcceptDemande);

export default demande_router;
