import express from 'express';
import {
  createVente,
  getAllVentes,
  getVenteById,
  updateVente,
  deleteVente,
  getStats,
  fetchStat
} from '../Controller/venteController.js';

const router = express.Router();

// CRUD Routes
router.post('/createVente', createVente);
router.get('/getAllVentes', getAllVentes);
router.get('/getVenteById/:id', getVenteById);
router.get('/fetchStat/:idEntreprise', fetchStat);

router.put('/updateVente/:id', updateVente);
router.delete('/deleteVente/:id', deleteVente);

// Route statistiques
router.get('/stats/chiffre-affaires', getStats);

export default router;