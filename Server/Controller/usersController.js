import Users from '../Model/Users.js';  // Assure-toi que ce modèle est correct !
import bcrypt, { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
// Créer un utilisateur
/*export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, entreprises_id } = req.body;
        const user = await Users.create({ name, email, password, role, entreprises_id });
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur.' });
    }
};*/
const saltRounds = 10;

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, entreprises_id, magasin_id  } = req.body;

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Création de l'utilisateur avec password hashé
    const user = await Users.create({
      name,
      email,
      password: hashedPassword,
      role,
      entreprises_id,
      magasin_id ,
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
  }
};

// Trouver un utilisateur par email
export const findUserByEmail = async (email) => {
  try {
    const user = await Users.findOne({ where: { email } });
    return user;
  } catch (error) {
    throw error; // La fonction appelante gère l'erreur
  }
};

  // Trouver un utilisateur par magasin
  export const findUserByStore = async (idMagasin) => {
    try {      
      const users = await Users.findAll({ 
        where: { 
          magasin_id: idMagasin 
        },
        attributes: {
          exclude: ['password'] // Exclure explicitement le mot de passe
        }
      });
      
      return users;
    } catch (error) {
      console.error("Erreur dans findUserByStore:", error);
      throw error;
    }
  };
  
  export const getUsersByStore = async (req, res) => {
    try {
      const { idMagasin } = req.params;
      
      // Validation
      if (!idMagasin) {
        return res.status(400).json({ message: "L'ID du magasin est requis" });
      }
  
      const users = await findUserByStore(idMagasin);
      
      if (!users || users.length === 0) {
        return res.status(404).json({ message: "Aucun utilisateur trouvé pour ce magasin" });
      }
  
      res.json(users);
    } catch (error) {
      console.error("Erreur dans getUsersByStore:", error);
      res.status(500).json({ 
        message: "Erreur serveur lors de la récupération des utilisateurs",
        error: error.message 
      });
    }
  };
/*export const findUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await Users.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la recherche.' });
    }
};*/

// Récupérer tous les utilisateurs sauf Admin
export const getAllUsersExcludingAdmin = async (req, res) => {
  const entreprises_id = parseInt(req.params.id, 10);
  if (isNaN(entreprises_id)) {
    return res.status(400).json({ error: "entreprises_id invalide" });
  }

  try {
    const users = await Users.findAll({
      where: {
        role: { [Op.not]: 'Admin' },
        entreprises_id: entreprises_id
      },
      attributes: { exclude: ['password'] }
    });

    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur dans getAllUsersExcludingAdmin:", error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
  }
};

/*export const getAllUsersExcludingAdmin = async (req, res) => {
    try {
      const users = await Users.findAll({
        where: {
          role: {
            [Op.not]: 'Admin'  
          }
        }
      });
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
    }
  };*/
// Obtenir un utilisateur par ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await Users.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
    }
};

// update name user 
export const updateUserName = async(req, res) =>{
  try {
    const { idUser } = req.params;
    const { name } = req.body;
    const user = await Users.findByPk(idUser);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    user.name = name;
    await user.save();
    res.json({ message: "Nom mis à jour avec succès", user });
} catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur.' });
}
}

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.idUtilisateur) {
      return res.status(401).json({ error: "Utilisateur non authentifié" });
    }

    // Récupérer l'utilisateur depuis la base
    const user = await Users.findByPk(req.user.idUtilisateur);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Ancien mot de passe incorrect" });
    }

    // Hacher le nouveau mot de passe
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe dans la base
    user.password = hashedNewPassword;
    await user.save();

    res.json({ status: "Success", message: "Mot de passe mis à jour avec succès" });

  } catch (error) {
    console.error("Erreur updatePassword:", error);
    res.status(500).json({ error: "Erreur serveur lors de la mise à jour du mot de passe" });
  }
};

export const updateNotificationPreference = async (req, res) => {
  try {
    const { idUser } = req.params;
    const { NotificationPreference } = req.body;

    const [affectedRows] = await Users.update(
      { NotificationPreference },
      { where: { id: idUser } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé ou préférence inchangée' });
    }

    const updatedUser = await Users.findByPk(idUser, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Préférences mises à jour avec succès',
      user: updatedUser
    });
  } catch (error) {
    console.error('Erreur updateNotificationPreference:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getNotificationPreferenceByUser = async (req, res) => {
  try {
    const { idUser } = req.params;

    const user = await Users.findByPk(idUser, {
      attributes: ['NotificationPreference']
    });

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Conversion explicite en booléen
    const notificationPref = Boolean(user.NotificationPreference);
    
    // Debug: Afficher les valeurs
    console.log('Valeur brute:', user.NotificationPreference);
    console.log('Valeur convertie:', notificationPref);

    res.json({ 
      NotificationPreference: notificationPref 
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
