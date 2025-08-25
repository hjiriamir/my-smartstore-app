// services/userService.js
import Users from '../Model/Users.js';
import Session from '../Model/Session.js'
import Entreprises from '../Model/Entreprises.js';


export const getUserById = async (id) => {
  const user = await Users.findByPk(id);
  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  return user;
};

export const getTotalUtilisateursAdmin = async () => {
  try {
    const total = await Users.count({
      where: {
        role: 'admin'
      }
    });
    return total; 
  } catch (error) {
    console.error("Erreur dans getTotalUtilisateursAdmin:", error);
    throw error;
  }
}

export const getTotalUtilisateurConnectes = async () => {
  try {
    const sessions = await Session.findAll({
      attributes: ['userId'],
      group: ['userId']
    });

    const total = sessions.length;

    return total;
  } catch (error) {
    console.error("Erreur dans getTotalUtilisateurConnectes:", error);
    throw error;
  }
}


export const getUtilisateursAvecEntreprise = async () => {
  try {
    const utilisateurs = await Users.findAll({
      include: [
        {
          model: Entreprises,
          as: 'entreprise',
          attributes: ['id', 'nomEntreprise', 'adresse']
        },
        {
          model: Session,
          as: 'sessions',
          attributes: ['createdAt'],
          limit: 1,
          order: [['createdAt', 'DESC']],
          separate: true
        }
      ],
      attributes: ['id', 'name', 'email', 'role']
    });

    return utilisateurs;
  } catch (error) {
    console.error("Erreur dans getUtilisateursAvecEntreprise:", error);
    throw error;
  }
};