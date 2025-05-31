import express from 'express';
import * as categorieUpdateController from '../Controller/categorieUpdateController.js';

const routerCategorie = express.Router();

routerCategorie.post('/createCategorie', categorieUpdateController.createCategorie);
routerCategorie.post('/createCategorieList', categorieUpdateController.createCategorieList);
routerCategorie.get('/getAllCategories', categorieUpdateController.getAllCategories);
routerCategorie.get('/getCategorieById/:id', categorieUpdateController.getCategorieById);
routerCategorie.put('/updateCategorie/:id', categorieUpdateController.updateCategorie);
routerCategorie.delete('/deleteCategorie/:id', categorieUpdateController.deleteCategorie);

export default routerCategorie;
