import express from 'express';
import {
  createMagasin,
  getAllMagasins,
  getMagasinById,
  updateMagasin,
  deleteMagasin,
  createMagasinsList,
  getMagasinsByEntrepriseId,
  getMagasinByUser,
  getMagasinIdByCode,
  getPerformanceZones
} from '../Controller/magasinUpdateController.js';

const router = express.Router();

router.post('/createMagasin', createMagasin);
router.post('/createMagasinsList', createMagasinsList);
router.get('/getAllMagasins', getAllMagasins);
router.get('/getMagasinById/:id', getMagasinById);
router.get('/getMagasinByUser/:id', getMagasinByUser);
router.get('/getMagasinIdByCode', getMagasinIdByCode);
router.get('/getPerformanceZones', getPerformanceZones);


router.get('/getMagasinsByEntrepriseId/:id', getMagasinsByEntrepriseId);
router.put('/updateMagasin/:id', updateMagasin);
router.delete('/deleteMagasin/:id', deleteMagasin);
export default router;
