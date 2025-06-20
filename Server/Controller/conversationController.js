import Users from '../Model/Users.js';
import { Op, Sequelize } from 'sequelize';
import Conversation from '../Model/Conversation.js';
import ConversationParticipant from '../Model/ConversationParticipant.js';
// Créer une conversation avec participants
export const createConversation = async (req, res) => {
  try {
    const { titre, participants } = req.body;

    const conversation = await Conversation.create({ titre });

    if (participants && participants.length > 0) {
      const participantData = participants.map(userId => ({
        conversation_id: conversation.id,
        utilisateur_id: userId
      }));
      await ConversationParticipant.bulkCreate(participantData);
    }

    res.status(201).json({ message: 'Conversation créée', conversation });
  } catch (error) {
    console.error("Erreur createConversation:", error);
    res.status(500).json({ error: "Erreur lors de la création de la conversation." });
  }
};

// Obtenir toutes les conversations avec leurs participants
export const getAllConversations = async (req, res) => {
  try {
    const { conversation_id } = req.params; // ou req.query

    const whereCondition = conversation_id ? { id: conversation_id } : {};

    const conversations = await Conversation.findAll({
      where: whereCondition,
      include: [{
        model: Users,
        through: { attributes: [] },
        attributes: ['id', 'name', 'email']
      }]
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Erreur getAllConversations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des conversations." });
  }
};


export const getConversationsByParticipant = async (req, res) => {
  const { idUser } = req.params;

  if (!idUser) {
    return res.status(400).json({ error: "idUser manquant." });
  }

  try {
    const participations = await ConversationParticipant.findAll({
      where: { utilisateur_id: idUser },
      attributes: ['conversation_id']
    });

    const conversationIds = participations.map(p => p.conversation_id);

    if (conversationIds.length === 0) {
      return res.status(200).json([]);
    }

    const conversations = await Conversation.findAll({
      where: { id: conversationIds },
      include: [
        {
          model: ConversationParticipant,
          as: 'participants',
          include: [
            {
              model: Users,
              as: 'utilisateur',
              attributes: ['id', 'name', 'email']
            }
          ]
        }
      ],
      attributes: ['id', 'titre', 'date_creation']
    });

    // Ajouter manuellement le nombre de participants
    const result = conversations.map(conversation => {
      const convo = conversation.toJSON();
      convo.nbParticipants = convo.participants.length;
      return convo;
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur getConversationsByParticipant:", error);
    res.status(500).json({ error: error.message });
  }
};


