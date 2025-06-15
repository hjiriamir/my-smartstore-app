import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Users from './Users.js'; 

Conversation.belongsToMany(Users, {
  through: ConversationParticipant,
  foreignKey: 'conversation_id',
  otherKey: 'utilisateur_id'
});

Users.belongsToMany(Conversation, {
  through: ConversationParticipant,
  foreignKey: 'utilisateur_id',
  otherKey: 'conversation_id'
});

export { Conversation, ConversationParticipant };
