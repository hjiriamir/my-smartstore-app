import express from 'express';
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
} from '../Controller/promotionController.js';

const router = express.Router();

router.post('/createPromotion', createPromotion);
router.get('/getAllPromotions', getAllPromotions);
router.get('/getPromotionById/:id', getPromotionById);
router.put('/updatePromotion/:id', updatePromotion);
router.delete('/deletePromotion/:id', deletePromotion);

export default router;
