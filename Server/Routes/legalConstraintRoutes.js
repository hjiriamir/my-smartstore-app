import express from 'express';
import {
  createLegalConstraint,
  getAllLegalConstraints,
  getLegalConstraintById,
  updateLegalConstraint,
  deleteLegalConstraint,
  createLegalConstraintsList
} from '../Controller/legalConstraintController.js';

const router = express.Router();

router.post('/createLegalConstraint', createLegalConstraint); 
router.get('/getAllLegalConstraints', getAllLegalConstraints); 
router.get('/getLegalConstraintById/:id', getLegalConstraintById); 
router.put('/updateLegalConstraint/:id', updateLegalConstraint); 
router.delete('/deleteLegalConstraint/:id', deleteLegalConstraint); 
router.post('/createLegalConstraintsList/bulk', createLegalConstraintsList); 

export default router;
