// Routes/zoneRoutes.js
import express from 'express';
import {
  createZone,
  getAllZones,
  getZoneById,
  updateZone,
  deleteZone,
  createZonesList,
  getAllZonesMagasin
} from '../Controller/zoneUpdateController.js';

const router = express.Router();

router.post('/createZone', createZone);
router.post('/createZonesList', createZonesList);
router.get('/getAllZones', getAllZones);
router.get('/getZoneById/:id', getZoneById);
router.put('/updateZone/:id', updateZone);
router.delete('/deleteZone/:id', deleteZone);
router.get('/getZonesMagasin/:idMagasin', getAllZonesMagasin);


export default router;
