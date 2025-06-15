import express from 'express';
import {
  createConfirmation,
  getAllConfirmations,
  getConfirmationById,
  updateConfirmation,
  deleteConfirmation
} from '../Controller/confirmationImplantationController.js';

const router = express.Router();

router.post('/createConfirmation', createConfirmation);
router.get('/getAllConfirmations', getAllConfirmations);
router.get('/getConfirmationById/:id', getConfirmationById);
router.put('/updateConfirmation/:id', updateConfirmation);
router.delete('/deleteConfirmation/:id', deleteConfirmation);

export default router;
