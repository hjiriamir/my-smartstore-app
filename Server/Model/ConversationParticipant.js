import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Conversation from './Conversation.js';
import Users from './Users.js';

const ConversationParticipant = sequelize.define('conversation_participants', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {         
      model: Conversation,   
      key: 'id',         
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {         
      model: Users,   
      key: 'id',         
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  }
}, {
  timestamps: false
});

export default ConversationParticipant;
