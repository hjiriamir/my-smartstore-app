// Routes/chatMessageRoutes.js
import express from 'express';
import { createMessage, getMessagesByConversation, uploadFileAndCreateMessage, getMessageByEntreprise } from '../Controller/chatMessageController.js';



const router = express.Router();
router.post('/upload-message', uploadFileAndCreateMessage);
router.post('/createMessage', createMessage);
router.get('/getMessagesByConversation/:conversationId', getMessagesByConversation);
router.get('/getMessageByEntreprise/:idEntreprise', getMessageByEntreprise);


export default router;
