import express from 'express';
import {
  createFurnitureType,
  getAllFurnitureTypes,
  getFurnitureTypeById,
  updateFurnitureType,
  deleteFurnitureType
} from '../Controller/furnitureTypeController.js';

const router = express.Router();

router.post('/createFurnitureType', createFurnitureType);
router.get('/getAllFurnitureTypes', getAllFurnitureTypes);
router.get('/getFurnitureTypeById/:id', getFurnitureTypeById);
router.put('/updateFurnitureType/:id', updateFurnitureType);
router.delete('/deleteFurnitureType/:id', deleteFurnitureType);

export default router;
