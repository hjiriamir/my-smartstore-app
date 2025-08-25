import express from 'express';
import { createUser, 
        findUserByEmail, 
        getAllUsersExcludingAdmin, 
        getUserById,getUsersByStore,
        updateUserName,
        updatePassword,
        updateNotificationPreference,
        getNotificationPreferenceByUser,
        getActifUsersByEntreprise,
        getUtilisateursCeMoisParEntreprise,
        getEntrepriseByUser,
        getAllUsersActif,
        getStatistiquesUtilisateurs
     } from '../Controller/usersController.js';
import { verifyToken } from '../Middlewares/authMiddleware.js';

const router = express.Router();

router.post('/newUser', createUser);
router.get('/users/email/:email', findUserByEmail);
router.get('/users/store/:idMagasin', getUsersByStore);
router.get('/users/excluding-admin/:entreprises_id', getAllUsersExcludingAdmin);
router.get('/getActifUsersByEntreprise/:idEntreprise', getActifUsersByEntreprise);
router.get('/getUtilisateursCeMoisParEntreprise/:idEntreprise', getUtilisateursCeMoisParEntreprise);
router.get('/getEntrepriseByUser/:idUser', getEntrepriseByUser);

router.get('/getUserById/:id', getUserById);
router.get('/getAllUsersActif', getAllUsersActif);

router.put('/updateUserName/:idUser', updateUserName);
router.get('/getNotificationPreferenceByUser/:idUser', getNotificationPreferenceByUser);
router.get('/getStatistiquesUtilisateurs', getStatistiquesUtilisateurs);


router.put('/updateNotificationPreference/:idUser', updateNotificationPreference);

router.put('/updatePassword', verifyToken, updatePassword);

export default router;
