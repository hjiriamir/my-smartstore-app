// routes/entreprisesRoutes.js
import express from 'express';
import {
  createEntreprise,
  getAllEntreprises,
  getEntrepriseById,
  updateEntreprise,
  deleteEntreprise,
  getDashboardStats,
  getEntreprisesAvecInfos,
  mettreEntrepriseInactif,
  mettreEntrepriseSuspendu,
  activerAbonnementEntreprise,
  getDashboarEntreprisedStats,
  getAbonnementRepartition,
  getEvolutionChiffreAffaire,
  getEvolutionUsresEntreprises,
  getTopEntreprisesController
} from '../Controller/entreprisesController.js';

const router = express.Router();

router.post('/createEntreprice', createEntreprise);
router.get('/entreprises', getAllEntreprises);
router.get('/getEntrepriseById/:id', getEntrepriseById);
router.put('/entreprises/:id', updateEntreprise);
router.delete('/entreprises/:id', deleteEntreprise);

router.get('/getDashboardStats', getDashboardStats);
router.get('/getEntreprisesAvecInfos', getEntreprisesAvecInfos);
router.put('/inactif/:idEntreprise', mettreEntrepriseInactif);
router.put('/suspendu/:idEntreprise', mettreEntrepriseSuspendu);
router.put('/actif/:idEntreprise', activerAbonnementEntreprise);
router.put('/activer', activerAbonnementEntreprise);
router.get('/getDashboarEntreprisedStats', getDashboarEntreprisedStats);

router.get('/repartition', getAbonnementRepartition);
router.get('/evolution-chiffre-affaire', getEvolutionChiffreAffaire);
router.get('/evolution-users-entreprises', getEvolutionUsresEntreprises);
router.get('/top-entreprises', getTopEntreprisesController);







export default router;
