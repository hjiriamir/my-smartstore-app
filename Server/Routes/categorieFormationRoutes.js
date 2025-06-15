import express from 'express';
import {
  getAllCategories,
  getCategorieById,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} from '../Controller/categorieFormationController.js';

const router = express.Router();

router.get('/getAllCategoriesFormation', getAllCategories);
router.get('/getCategorieByIdFormation/:id', getCategorieById);
router.post('/createCategorieFormation', createCategorie);
router.put('/updateCategorieFormation/:id', updateCategorie);
router.delete('/deleteCategorieFormation/:id', deleteCategorie);

export default router;
