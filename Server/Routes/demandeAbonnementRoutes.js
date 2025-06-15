import express from 'express';
import {
  createDemande,
  getAllDemandes,
  getDemandeById,
  updateDemande,
  deleteDemande,
  updateDemandeStatus
} from '../Controller/demandeAbonnementController.js';

const router = express.Router();

router.post('/createDemande', createDemande);          
router.get('/getAllDemandes', getAllDemandes);         
router.get('/getDemandeById/:id', getDemandeById);      
router.put('/updateDemande/:id', updateDemande);        
router.delete('/deleteDemande/:id', deleteDemande);    
router.put('/updateDemandeStatus/:id', updateDemandeStatus);     

export default router;
