import express from 'express';
import {
  createPlanogram,
  getAllPlanograms,
  getPlanogramById,
  updatePlanogram,
  deletePlanogram,
  createFullPlanogram
} from '../Controller/planogramController.js';

const router = express.Router();

router.post('/createPlanogram', createPlanogram);
router.post('/createFullPlanogram', createFullPlanogram);
router.get('/getAllPlanograms', getAllPlanograms);
router.get('/getPlanogramById/:id', getPlanogramById);
router.put('/updatePlanogram/:id', updatePlanogram);
router.delete('/deletePlanogram/:id', deletePlanogram);

export default router;
