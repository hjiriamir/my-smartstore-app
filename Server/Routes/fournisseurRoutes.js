import express from 'express';
import {
  createFournisseur,
  getAllFournisseurs,
  getFournisseurById,
  updateFournisseur,
  deleteFournisseur,
  createFournisseursList,
  getAllFournisseursByEntreprise
} from '../Controller/fournisseurController.js';

const router = express.Router();

router.post('/createFournisseur/:idEntreprise', createFournisseur);
router.post('/createFournisseursList', createFournisseursList);
router.get('/getAllFournisseurs', getAllFournisseurs);
router.get('/getFournisseurById/:fournisseur_id', getFournisseurById);
router.get('/getAllFournisseursByEntreprise/:idEntreprise', getAllFournisseursByEntreprise);

router.put('/updateFournisseur/:fournisseur_id', updateFournisseur);
router.delete('/deleteFournisseur/:fournisseur_id', deleteFournisseur);

export default router;
