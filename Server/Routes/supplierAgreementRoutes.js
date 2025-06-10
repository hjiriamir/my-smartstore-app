import express from 'express';
import {
  createAgreement,
  getAllAgreements,
  getAgreementById,
  updateAgreement,
  deleteAgreement
} from '../Controller/supplierAgreementController.js';

const router = express.Router();

// CRUD Routes
router.post('/createAgreement', createAgreement);
router.get('/getAllAgreements', getAllAgreements);
router.get('/getAgreementById/:id', getAgreementById);
router.put('/updateAgreement/:id', updateAgreement);
router.delete('/deleteAgreement/:id', deleteAgreement);

export default router;