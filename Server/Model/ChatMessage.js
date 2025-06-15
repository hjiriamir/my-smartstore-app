import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const ChatMessage = sequelize.define('chat_messages', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date_envoi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fichier_joint_url: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: false
});

export default ChatMessage;
