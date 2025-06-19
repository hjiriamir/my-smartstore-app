import Notification from '../Model/Notification.js';

// Créer une notification
export const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la notification." });
  }
};

// Obtenir toutes les notifications
export const getAllNotifications = async (req, res) => {
  try {
   
    const notifications = await Notification.findAll();
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des notifications." });
  }
};

// Obtenir une notification par ID
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Notification non trouvée." });
    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération." });
  }
};

// Marquer une notification comme lue
export const markAsRead = async (req, res) => {

  try {
    const { idNotification } = req.params;
    const notification = await Notification.findByPk(idNotification);
    if (!notification) return res.status(404).json({ error: "Notification non trouvée." });

    notification.lu = true;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la mise à jour." });
  }
};

// Supprimer une notification
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ error: "Notification non trouvée." });

    await notification.destroy();
    res.status(200).json({ message: "Notification supprimée avec succès." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la suppression." });
  }
};

export const getNotificationsByUser = async (req, res) => {
  try {
    const { idUser } = req.params;

    if (!idUser) {
      return res.status(400).json({ error: "idUser manquant." });
    }

    const notifications = await Notification.findAll({
      where: { utilisateur_id: idUser },
      order: [['date_envoi', 'DESC']] // pour trier de la plus récente à la plus ancienne
    });

    return res.status(200).json({ notifications });

  } catch (error) {
    console.error('Erreur dans getNotificationsByUser:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const markReadNotification = async (req, res) => {
  try {
  const { userId, notificationId } = req.params;

  // 1. Trouver la notification
  const notification = await Notification.findOne({
    where: {
        id: notificationId,
        Utilisateur_id: userId
    }
    });
    if (!notification) {
      return res.status(404).json({
          success: false,
          message: "Notification non trouvée ou vous n'y avez pas accès"
      });
    }
      

} catch (error) {
  console.error("Erreur lors du marquage comme lu:", error);
  res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
  });
}
}