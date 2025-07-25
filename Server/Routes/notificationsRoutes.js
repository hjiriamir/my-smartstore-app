import express from 'express';
import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
  getNotificationsByUser,
  
} from '../Controller/notificationController.js';

const router = express.Router();

router.post('/createNotification', createNotification);
router.get('/getAllNotifications', getAllNotifications);
router.get('/getNotificationById/:id', getNotificationById);
router.get('/getNotificationsByUser/:idUser', getNotificationsByUser);
router.patch('/markAsRead/:idNotification', markAsRead);


router.put('/markAsRead/:id/read', markAsRead);
router.delete('/deleteNotification/:id', deleteNotification);

export default router;
