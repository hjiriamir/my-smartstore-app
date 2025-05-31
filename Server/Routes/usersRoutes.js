import express from 'express';
import { createUser, findUserByEmail, getAllUsersExcludingAdmin, getUserById } from '../Controller/usersController.js';

const router = express.Router();

router.post('/newUser', createUser);
router.get('/users/email/:email', findUserByEmail);
router.get('/users/excluding-admin', getAllUsersExcludingAdmin);
router.get('/users/:id', getUserById);

export default router;
