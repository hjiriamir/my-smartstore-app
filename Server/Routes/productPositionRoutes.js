import express from 'express';
import {
  createProductPosition,
  getAllProductPositions,
  getProductPositionById,
  updateProductPosition,
  deleteProductPosition
} from '../Controller/productPositionController.js';

const router = express.Router();

router.post('/createProductPosition', createProductPosition);
router.get('/getAllProductPositions', getAllProductPositions);
router.get('/getProductPositionById/:id', getProductPositionById);
router.put('/updateProductPosition/:id', updateProductPosition);
router.delete('/deleteProductPosition/:id', deleteProductPosition);

export default router;
