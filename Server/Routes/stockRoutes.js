import express from 'express';
import {
  upsertStock,
  getAllStocks,
  getStock,
  deleteStock,
} from '../Controller/stockController.js';

const router = express.Router();

// Créer ou mettre à jour un stock
router.post('/upsertStock', upsertStock);

// Récupérer tous les stocks
router.get('/getAllStocks', getAllStocks);

// Récupérer un stock spécifique (clé composite produit_id + magasin_id)
router.get('/getStock/:produit_id/:magasin_id', getStock);

// Supprimer un stock
router.delete('/deleteStock/:produit_id/:magasin_id', deleteStock);

export default router;
