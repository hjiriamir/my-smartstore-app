import Session from '../Model/Session.js';

// Récupérer toutes les sessions actives de l'utilisateur connecté
export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.idUtilisateur; // suppose que l'ID utilisateur vient d'un middleware d'auth

    const sessions = await Session.findAll({
      where: { userId, isActive: true },
      attributes: ['id', 'userAgent', 'ipAddress', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    res.json({ count: sessions.length, sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des sessions' });
  }
};

// Déconnecter (désactiver) une session par son id
export const logoutSession = async (req, res) => {
  try {
    const userId = req.user.idUtilisateur;
    const { sessionId } = req.params;

    const session = await Session.findOne({ where: { id: sessionId, userId, isActive: true } });

    if (!session) {
      return res.status(404).json({ error: 'Session non trouvée ou déjà déconnectée' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session déconnectée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la déconnexion' });
  }
};
