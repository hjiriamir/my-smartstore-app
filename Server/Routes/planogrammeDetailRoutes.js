import express from 'express';
import {
  getAllPlanogrammeDetails,
  getPlanogrammeDetailById,
  createPlanogrammeDetail,
  updatePlanogrammeDetail,
  deletePlanogrammeDetail,
  createManyPlanogrammeDetails,
} from '../Controller/planogrammeDetailController.js';

const router = express.Router();

router.get('/getAllPlanogrammeDetails', getAllPlanogrammeDetails);
router.get('/getPlanogrammeDetailById/:id', getPlanogrammeDetailById);
router.post('/createPlanogrammeDetail', createPlanogrammeDetail);
router.post('/createManyPlanogrammeDetails', createManyPlanogrammeDetails);
router.put('/updatePlanogrammeDetail/:id', updatePlanogrammeDetail);
router.delete('/deletePlanogrammeDetail/:id', deletePlanogrammeDetail);

export default router;
