import express from 'express';
import {
  getAllFormations,
  getFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
  getFormationsByEntreprise,
  getFormationsCeMoisParEntreprise 
} from '../Controller/formationController.js';

const router = express.Router();

router.get('/getAllFormations', getAllFormations);
router.get('/getFormationById/:id', getFormationById);
router.get('/getFormationsByEntreprise/:idEntreprie', getFormationsByEntreprise);
router.get('/getFormationsCeMoisParEntreprise/:idEntreprise', getFormationsCeMoisParEntreprise);


router.post('/createFormation', createFormation);
router.put('/updateFormation/:id', updateFormation);
router.delete('/deleteFormation/:id', deleteFormation);

export default router;
