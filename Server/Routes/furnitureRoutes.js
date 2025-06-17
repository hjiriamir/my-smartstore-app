import express from 'express';
import {
  createFurniture,
  getAllFurnitures,
  getFurnitureById,
  updateFurniture,
  deleteFurniture
} from '../Controller/furnitureController.js';

const router = express.Router();

router.post('/createFurniture', createFurniture);
router.get('/getAllFurnitures', getAllFurnitures);
router.get('/getFurnitureById/:id', getFurnitureById);
router.put('/updateFurniture/:id', updateFurniture);
router.delete('/deleteFurniture/:id', deleteFurniture);

export default router;
