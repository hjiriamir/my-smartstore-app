import express from 'express';
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientByEntreprise,
} from '../Controller/clientController.js';

const router = express.Router();

router.get('/getAllClients', getAllClients);
router.get('/getClientById/:id', getClientById);
router.post('/createClient', createClient);
router.put('/updateClient/:id', updateClient);
router.delete('/deleteClient/:id', deleteClient);
router.get('/getClientByEntreprise/:idEntreprise', getClientByEntreprise);


export default router;
