// Controller/conversationParticipantController.js
import ConversationParticipant from '../Model/ConversationParticipant.js';
import Users from '../Model/Users.js';
import Conversation from '../Model/Conversation.js';

// Ajouter un participant
export const addParticipant = async (req, res) => {
  const { conversation_id, utilisateur_id } = req.body;

  if (!conversation_id || !utilisateur_id) {
    return res.status(400).json({ error: 'conversation_id et utilisateur_id sont requis.' });
  }

  try {
    const participant = await ConversationParticipant.create({
      conversation_id,
      utilisateur_id
    });

    res.status(201).json(participant);
  } catch (error) {
    console.error('Erreur lors de l’ajout du participant :', error);
    res.status(500).json({ error: error.message });
  }
};

// Obtenir les participants d’une conversation
export const getParticipantsByConversation = async (req, res) => {
  const { conversationId, idUser } = req.params;

  try {
    const participants = await ConversationParticipant.findAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: Users,
          as: 'utilisateur',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(200).json(participants);
  } catch (error) {
    console.error('Erreur lors de la récupération des participants :', error);
    res.status(500).json({ error: error.message });
  }
};

// Supprimer un participant
export const removeParticipant = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await ConversationParticipant.destroy({ where: { id } });

    if (deleted) {
      res.status(200).json({ message: 'Participant supprimé avec succès.' });
    } else {
      res.status(404).json({ error: 'Participant non trouvé.' });
    }
  } catch (error) {
    console.error('Erreur suppression participant :', error);
    res.status(500).json({ error: error.message });
  }
};
