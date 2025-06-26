// Controller/commentaireController.js
import Commentaire from '../Model/Commentaire.js';
import Planogram from '../Model/Planogram.js';
import Users from '../Model/Users.js';

export const createCommentaire = async (req, res) => {
  try {
    const commentaire = await Commentaire.create(req.body);
    res.status(201).json(commentaire);
  } catch (error) {
    console.error("Erreur lors de la création du commentaire :", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCommentaires = async (req, res) => {
  try {
    const commentaires = await Commentaire.findAll({
      include: [
        {
          model: Planogram,
          as: 'planogram',
          attributes: ['planogram_id', 'nom', 'date_creation']
        }
      ],
      order: [['date_creation', 'DESC']]
    });
    res.status(200).json(commentaires);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCommentairesByPlanogram = async (req, res) => {
  const { planogramId } = req.params;
  try {
    const commentaires = await Commentaire.findAll({
      where: { planogram_id: planogramId },
      include: [
        {
          model: Users,
          as: 'utilisateur',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date_creation', 'DESC']]
    });
    res.status(200).json(commentaires);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires du planogramme :", error);
    res.status(500).json({ error: error.message });
  }
};


export const getCommentsByEntreprise = async (req, res) => {
  const idEntreprise = parseInt(req.params.idEntreprise, 10);

  if (isNaN(idEntreprise)) {
    return res.status(400).json({ error: "idEntreprise invalide" });
  }

  try {
    // 1. Récupérer les utilisateurs de l'entreprise avec plus d'informations
    const users = await Users.findAll({
      where: { entreprises_id: idEntreprise },
      attributes: ['id', 'name', 'email', 'role'], 
    });

    // 2. Récupérer les commentaires pour chaque utilisateur
    const usersWithCommets = await Promise.all(users.map(async (user) => {
      const comments = await Commentaire.findAndCountAll({
        where: { utilisateur_id: user.id }
      });

      return {
        utilisateur: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        nombre_comments: comments.count,
        comments: comments.rows
      };
    }));

    // 3. Calculer le nombre total de messages pour l'entreprise
    const totalComments = usersWithCommets.reduce(
      (total, user) => total + user.nombre_comments, 0
    );

    res.status(200).json({
      nombre_total_comments: totalComments,
      nombre_utilisateurs: users.length,
      utilisateurs: usersWithCommets
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};