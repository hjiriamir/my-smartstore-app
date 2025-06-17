import express from 'express';
import { createUser, findUserByEmail, getAllUsersExcludingAdmin, getUserById,getUsersByStore } from '../Controller/usersController.js';

const router = express.Router();

router.post('/newUser', createUser);
router.get('/users/email/:email', findUserByEmail);
router.get('/users/store/:idMagasin', getUsersByStore);
router.get('/users/excluding-admin/:entreprises_id', getAllUsersExcludingAdmin);
router.get('/getUserById/:id', getUserById);

export default router;
