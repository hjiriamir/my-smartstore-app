import Conversation from './Conversation.js';
import ConversationParticipant from './ConversationParticipant.js';
import Users from './Users.js';
import Furniture from './Furniture.js';
import Tache from './Tache.js';
import Planogram from './Planogram.js';
import Zone1 from './zone1.js';
// === Associations Conversation/Users===
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

//association Tache -> Planogram ===
// Une Tache appartient à un Planogram
Tache.belongsTo(Planogram, {
  foreignKey: 'planogram_id',
  as: 'planogram',
});

// Un Planogram a plusieurs Taches
Planogram.hasMany(Tache, {
  foreignKey: 'planogram_id',
  as: 'taches',
});

Planogram.hasMany(Furniture, { foreignKey: 'planogram_id', as: 'furnitures' });
Furniture.belongsTo(Planogram, { foreignKey: 'planogram_id', as: 'planogram' });
Planogram.belongsTo(Zone1, {
  foreignKey: 'zone_id',
  targetKey: 'zone_id', // cible la colonne unique zone_id dans zones
  as: 'zone'
});
export {
  Conversation,
  ConversationParticipant,
  Users,
  Tache,
  Planogram,
  Furniture,
  Zone1
};
