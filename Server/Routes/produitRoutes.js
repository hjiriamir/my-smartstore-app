import express from 'express';
import {
  createProduit,
  getAllProduits,
  getProduitById,
  updateProduit,
  deleteProduit,
  createProduitsList,
  getProduitDetails
} from '../Controller/produitController.js';

const router = express.Router();

router.post('/createProduit', createProduit);              
router.get('/getAllProduits', getAllProduits);
router.get('/getProduitDetails/:idMagasin', getProduitDetails);              

router.get('/getProduitById/:id', getProduitById);         
router.put('/updateProduit/:id', updateProduit);          
router.delete('/deleteProduit/:id', deleteProduit);      
router.post('/createProduitsList', createProduitsList);   

export default router;
