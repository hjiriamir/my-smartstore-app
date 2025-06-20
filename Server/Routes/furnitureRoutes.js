import express from 'express';
import {
  createFurniture,
  getAllFurnitures,
  getFurnitureById,
  updateFurniture,
  deleteFurniture,
  getFurnituresByUser
} from '../Controller/furnitureController.js';

const router = express.Router();

router.post('/createFurniture', createFurniture);
router.get('/getAllFurnitures', getAllFurnitures);
router.get('/getFurnitureById/:id', getFurnitureById);
router.get('/getFurnituresByUser/:idUser', getFurnituresByUser);
router.put('/updateFurniture/:id', updateFurniture);
router.delete('/deleteFurniture/:id', deleteFurniture);

export default router;
