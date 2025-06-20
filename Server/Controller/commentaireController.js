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

