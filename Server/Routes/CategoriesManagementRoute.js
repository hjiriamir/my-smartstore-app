import express from 'express';
import { createNewMagasin, createNewMagasins} from '../Controller/magasinController.js';
import { createNewCategorie,createNewCategories} from '../Controller/categorieController.js';
import { createNewZone, createNewZones} from '../Controller/zoneController.js';

const management_router = express.Router();

management_router.post('/createMagasin', createNewMagasin);
management_router.post('/createMagasins', createNewMagasins);

management_router.post('/createCategorie', createNewCategorie);
management_router.post('/createCategories', createNewCategories);

management_router.post('/createZone', createNewZone);
management_router.post('/createZones', createNewZones);

export default management_router;