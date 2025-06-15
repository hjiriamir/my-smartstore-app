import express from 'express';
import { createConversation, getAllConversations } from '../Controller/conversationController.js';

const router = express.Router();

router.post('/createConversation', createConversation);
router.get('/getAllConversations', getAllConversations);

export default router;
