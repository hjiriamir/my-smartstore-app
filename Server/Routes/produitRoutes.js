import express from 'express';
import {
  createProduit,
  getAllProduits,
  getProduitById,
  updateProduit,
  deleteProduit,
  createProduitsList,
  getProduitDetails,
  getProductIdsByCodes,
  getProductIdsFromCodes,
  getProductsByMagasin,
  getProduitsByCategorie
} from '../Controller/produitController.js';

const router = express.Router();

router.post('/createProduit', createProduit);              
router.get('/getAllProduits', getAllProduits);
router.get('/getProduitDetails/:idMagasin', getProduitDetails);             
router.get('/getProductIdsByCodes/:productCode', getProductIdsByCodes);  
router.get('/getProductsByMagasin/:idMagasin', getProductsByMagasin);   
router.get('/getProduitsByCategorie/:idCategorie', getProduitsByCategorie);   

router.get('/getProductIdsFromCodes', getProductIdsFromCodes);              


router.get('/getProduitById/:id', getProduitById);         
router.put('/updateProduit/:id', updateProduit);          
router.delete('/deleteProduit/:id', deleteProduit);      
router.post('/createProduitsList', createProduitsList);   

export default router;
