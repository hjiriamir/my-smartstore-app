// Routes/conversationParticipantRoutes.js
import express from 'express';
import {
  addParticipant,
  getParticipantsByConversation,
  removeParticipant
} from '../Controller/conversationParticipantController.js';

const router = express.Router();

// Ajouter un participant
router.post('/addParticipant', addParticipant);

// Lister les participants d'une conversation
router.get('/getParticipantsByConversation/:conversationId', getParticipantsByConversation);

// Supprimer un participant
router.delete('/removeParticipant/:id', removeParticipant);

export default router;
