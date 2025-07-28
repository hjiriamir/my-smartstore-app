import express from 'express';
import {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  getRevenuPromo,
  getCoutTotal,
  getPromotionsByEntrepriseAndMagsins,
} from '../Controller/promotionController.js';

const router = express.Router();

router.post('/createPromotion', createPromotion);
router.get('/getAllPromotions', getAllPromotions);
router.get('/getPromotionById/:id', getPromotionById);
router.put('/updatePromotion/:id', updatePromotion);
router.delete('/deletePromotion/:id', deletePromotion);
router.get("/active", getActivePromotions);
router.get('/revenu-promo', getRevenuPromo);
router.get('/cout-total', getCoutTotal);
router.get('/promos', getPromotionsByEntrepriseAndMagsins);

export default router;
