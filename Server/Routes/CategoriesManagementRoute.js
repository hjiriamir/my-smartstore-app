import express from 'express';
import { createNewMagasin, createNewMagasins, getAllMagasinsController, updateMagasinController} from '../Controller/magasinController.js';
import { createNewCategorie,createNewCategories, getAllCategoriesController, updateCategorieController} from '../Controller/categorieController.js';
import { createNewZone, createNewZones, getAllZonesController, updateZoneController} from '../Controller/zoneController.js';

const management_router = express.Router();

management_router.post('/createMagasin', createNewMagasin);
management_router.post('/createMagasins', createNewMagasins);
management_router.get('/getAllMagasins', getAllMagasinsController);
management_router.put('/updateMagasin/:id', updateMagasinController);

management_router.post('/createCategorie', createNewCategorie);
management_router.post('/createCategories', createNewCategories);
management_router.get('/getAllCategories', getAllCategoriesController);
management_router.put('/updateCategorie/:id', updateCategorieController);

management_router.post('/createZone', createNewZone);
management_router.post('/createZones', createNewZones);
management_router.get('/getAllZones', getAllZonesController);
management_router.put('/updateZone/:id', updateZoneController);

export default management_router;