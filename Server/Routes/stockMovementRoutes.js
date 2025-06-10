import express from 'express';
import {
  createStockMovement,
  getAllStockMovements,
  getStockMovementById,
  updateStockMovement,
  deleteStockMovement
} from '../Controller/stockMovementController.js';

const router = express.Router();

router.post('/createStockMovement', createStockMovement);
router.get('/getAllStockMovements', getAllStockMovements);
router.get('/getStockMovementById/:id', getStockMovementById);
router.put('/updateStockMovement/:id', updateStockMovement);
router.delete('/deleteStockMovement/:id', deleteStockMovement);

export default router;
