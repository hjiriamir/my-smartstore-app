import express from 'express';
import { createNewMagasin} from '../Controller/magasinController.js';
import { createNewCategorie} from '../Controller/categorieController.js';
import { createNewZone} from '../Controller/zoneController.js';

const management_router = express.Router();

management_router.post('/createMagasin', createNewMagasin);
management_router.post('/createCategorie', createNewCategorie);
management_router.post('/createZone', createNewZone);

export default management_router;