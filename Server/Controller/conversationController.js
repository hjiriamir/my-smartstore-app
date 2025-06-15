import { Conversation, ConversationParticipant } from '../Model/associations.js';
import Users from '../Model/Users.js';

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
    const conversations = await Conversation.findAll({
      include: [{
        model: Users,
        through: { attributes: [] }, // Ne pas inclure les infos de la table pivot
        attributes: ['id', 'name', 'email'] // ou autres attributs utiles
      }]
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Erreur getAllConversations:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des conversations." });
  }
};
