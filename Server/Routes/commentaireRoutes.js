// Routes/commentaireRoutes.js
import express from 'express';
import {
  createCommentaire,
  getCommentaires,
  getCommentairesByPlanogram,
  getCommentsByEntreprise
} from '../Controller/commentaireController.js';

const router = express.Router();

router.post('/createCommentaire', createCommentaire);
router.get('/getCommentaires', getCommentaires);
router.get('/getCommentairesByPlanogram/:planogramId', getCommentairesByPlanogram);
router.get('/getCommentsByEntreprise/:idEntreprise', getCommentsByEntreprise);


export default router;
