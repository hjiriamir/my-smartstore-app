import express from 'express';
import { createNewMessage} from '../Controller/contactMessageController.js';

const contact_router = express.Router();

contact_router.post('/createMessage', createNewMessage);

export default contact_router;