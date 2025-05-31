// Routes/zoneRoutes.js
import express from 'express';
import {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  createZonesList
} from '../Controller/zoneUpdateController.js';

const router = express.Router();

router.post('/createZone', createZone);
router.post('/createZonesList', createZonesList);
router.get('/getAllZones', getAllZones);
router.get('/getZoneById/:id', getZoneById);
router.put('/updateZone/:id', updateZone);
router.delete('/deleteZone/:id', deleteZone);

export default router;
