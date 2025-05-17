import express from 'express';
import { register, login, logout, getMe, forgotPassword , resetPassword } from '../Controller/authController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';
import { createNewUser, getUsersExcludingAdmin } from '../Controller/userController.js';


const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.post('/newUser', createNewUser);
router.get('/users/excluding-admin', getUsersExcludingAdmin);
router.get('/me', verifyToken, getMe); // Nouvelle route pour /me
// Route pour la demande de réinitialisation du mot de passe
router.post('/forgotPassword', forgotPassword);

// Route pour la réinitialisation du mot de passe
router.post('/reset-password/:token', resetPassword);
router.get('/', verifyToken, (req, res) => {
    res.json({ Status: "Success", name: req.name, role: req.role });
});
export default router;
