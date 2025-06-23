import Session from '../Model/Session.js';
import useragent from 'useragent';

// Récupérer toutes les sessions actives de l'utilisateur connecté
export const getActiveSessions = async (req, res) => {
  try {
    const userId = req.user.idUtilisateur;

    const sessions = await Session.findAll({
      where: { userId, isActive: true },
      attributes: ['id', 'userAgent', 'ipAddress', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      raw: true
    });

    const formattedSessions = sessions.map(session => {
      const agent = useragent.parse(session.userAgent || '');
      const browser = agent.toAgent();             // Ex: Chrome 114.0
      const os = agent.os.toString();              // Ex: Windows 10
      const deviceType = agent.device.family || 'Ordinateur';

      return {
        id: session.id,
        ipAddress: session.ipAddress,
        browser,
        os,
        deviceType: deviceType === 'Other' ? 'Ordinateur' : deviceType,
        lastActivity: session.updatedAt,
        createdAt: session.createdAt,
      };
    });

    res.json({ count: formattedSessions.length, sessions: formattedSessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des sessions' });
  }
};


// Déconnecter (désactiver) une session par son ii
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
