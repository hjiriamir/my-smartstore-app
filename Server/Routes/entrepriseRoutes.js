import express from 'express';
import { createNewEntreprise, getEntrepriseById } from '../Controller/entrepriseController.js';


const entreprice_router = express.Router();

entreprice_router.post('/createEntreprice', createNewEntreprise);
entreprice_router.get('/entreprise/:entreprise_id', getEntrepriseById);
export default entreprice_router;
