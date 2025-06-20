import express from 'express';
import { createConversation, getAllConversations, getConversationsByParticipant } from '../Controller/conversationController.js';

const router = express.Router();

router.post('/createConversation', createConversation);
router.get('/getAllConversations/:conversation_id', getAllConversations);
router.get('/getConversationsByParticipant/:idUser', getConversationsByParticipant);


export default router;
