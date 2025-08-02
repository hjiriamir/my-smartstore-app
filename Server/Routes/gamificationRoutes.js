import express from 'express';
import {
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  addParticipation,
  updateProgress,
  getParticipations,
  getChallengeByStore,
  addMultipleParticipations,
  getClientOrderer,
  getJoueursChallenge,
  getPointsTotaux,
  getChallengeActifs,
  getTauxParticipationClients,
  traiterAchatAvecPoints
} from '../Controller/gamificationController.js';

const router = express.Router();

// --- Routes pour les challenges --- //
router.post('/challenges', createChallenge);
router.get('/challenges', getChallenges);
router.get('/challenges/:id', getChallengeById);
router.put('/challenges/:id', updateChallenge); 
router.delete('/challenges/:id', deleteChallenge);
router.get('/getChallengeByStore/:idMagasin', getChallengeByStore);
router.post("/addMultipleParticipations", addMultipleParticipations);
// --- Routes pour les participations --- //
router.post('/participations', addParticipation);
router.put('/participations/:id', updateProgress);
router.get('/participations', getParticipations);
router.get('/getClientOrderer/:idEntreprise', getClientOrderer);
router.get('/getPointsTotaux/:idEntreprise', getPointsTotaux);
router.get('/getChallengeActifs/:idEntreprise', getChallengeActifs);
router.get('/getTauxParticipationClients/:idEntreprise', getTauxParticipationClients);
router.post('/achats', traiterAchatAvecPoints);

router.get('/getJoueursChallenge/:idChallenge', getJoueursChallenge);


export default router;
