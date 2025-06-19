import express from 'express';
import {
  createTache,
  getAllTaches,
  getTacheById,
  updateTache,
  deleteTache,
  tachesEnAttente,
  tachesTermine
} from '../Controller/tacheController.js';

const router = express.Router();

router.post('/createTache', createTache);
router.get('/getAllTaches', getAllTaches);
router.get('/getTacheById/:id', getTacheById);
router.get('/tachesEnAttente/:idMagasin/:idUser', tachesEnAttente);
router.get('/tachesTermine/:idMagasin/:idUser', tachesTermine);
router.put('/updateTache/:id', updateTache);
router.delete('/deleteTache/:id', deleteTache);

export default router;
