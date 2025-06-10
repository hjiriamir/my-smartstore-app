import express from 'express';
import {
  createConversionZone,
  getAllConversionZones,
  getConversionZoneById,
  updateConversionZone,
  deleteConversionZone
} from '../Controller/conversionZoneController.js';

const router = express.Router();

router.post('/createConversionZone', createConversionZone);
router.get('/getAllConversionZones', getAllConversionZones);
router.get('/getConversionZoneById/:id', getConversionZoneById);
router.put('/updateConversionZone/:id', updateConversionZone);
router.delete('/deleteConversionZone/:id', deleteConversionZone);

export default router;
