import express from 'express';
import {
  createPlanogramme,
  getAllPlanogrammes,
  getPlanogrammeById,
  updatePlanogramme,
  deletePlanogramme
} from '../Controller/PlanogrammeController.js';

const router = express.Router();

// Créer un planogramme
router.post('/createPlanogramme', createPlanogramme);

// Obtenir tous les planogrammes
router.get('/getAllPlanogrammes', getAllPlanogrammes);

// Obtenir un planogramme par ID
router.get('/getPlanogrammeById/:id', getPlanogrammeById);

// Mettre à jour un planogramme
router.put('/updatePlanogramme/:id', updatePlanogramme);

// Supprimer un planogramme
router.delete('/deletePlanogramme/:id', deletePlanogramme);

export default router;
