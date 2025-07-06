import express from 'express';
import {
  createPlanogram,
  getAllPlanograms,
  getPlanogramById,
  updatePlanogram,
  deletePlanogram,
  createFullPlanogram,
  getPlanogramsByMagasin,
  tauxImplementation,
  planogramsRecent,
  getPlanogramDetails,
  fetchPlanogramByStore,
  createFullPlanogramm
} from '../Controller/planogramController.js';

const router = express.Router();

router.post('/createPlanogram', createPlanogram);
router.post('/createFullPlanogram', createFullPlanogram);
router.post('/createFullPlanogramm', createFullPlanogramm);

router.get('/getAllPlanograms', getAllPlanograms);
router.get('/getPlanogramById/:id', getPlanogramById);
router.get('/getPlanogramDetails/:idMagasin', getPlanogramDetails);
router.get('/fetchPlanogramByStore/:idMagasin', fetchPlanogramByStore);


router.get('/tauxImplementation/:idMagasin/:idUser', tauxImplementation);
router.get('/planogramsRecent/:idMagasin/:idUser', planogramsRecent);


router.get('/getPlanogramsByMagasin/:idMagasin/:idUser', getPlanogramsByMagasin);
router.put('/updatePlanogram/:id', updatePlanogram);
router.delete('/deletePlanogram/:id', deletePlanogram);

export default router;
