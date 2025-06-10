import express from 'express';
import {
  createFournisseur,
  getAllFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur,
  createFournisseursList
} from '../Controller/fournisseurController.js';

const router = express.Router();

router.post('/createFournisseur', createFournisseur);
router.post('/createFournisseursList', createFournisseursList);
router.get('/getAllFournisseurs', getAllFournisseurs);
router.get('/getFournisseurById/:fournisseur_id', getFournisseurById);
router.put('/updateFournisseur/:fournisseur_id', updateFournisseur);
router.delete('/deleteFournisseur/:fournisseur_id', deleteFournisseur);

export default router;
