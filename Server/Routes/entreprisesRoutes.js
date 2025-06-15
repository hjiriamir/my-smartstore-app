// routes/entreprisesRoutes.js
import express from 'express';
import {
  createEntreprise,
  getAllEntreprises,
  getEntrepriseById,
  updateEntreprise,
  deleteEntreprise,
} from '../Controller/entreprisesController.js';

const router = express.Router();

router.post('/createEntreprice', createEntreprise);
router.get('/entreprises', getAllEntreprises);
router.get('/getEntrepriseById/:id', getEntrepriseById);
router.put('/entreprises/:id', updateEntreprise);
router.delete('/entreprises/:id', deleteEntreprise);

export default router;
