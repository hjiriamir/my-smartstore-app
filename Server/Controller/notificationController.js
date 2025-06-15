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
    const notification = await Notification.findByPk(req.params.id);
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
