import express from 'express';
import {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../Controller/faqController.js';

const router = express.Router();

router.get('/getAllFaqs', getAllFaqs);
router.get('/getFaqById/:id', getFaqById);
router.post('/createFaq', createFaq);
router.put('/updateFaq/:id', updateFaq);
router.delete('/deleteFaq/:id', deleteFaq);

export default router;
