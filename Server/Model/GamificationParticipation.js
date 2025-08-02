import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const GamificationParticipation = sequelize.define('GamificationParticipation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  challenge_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gamification_challenges',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients', 
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  progression: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  points_gagnes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  date_participation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'gamification_participations',
  timestamps: false,
});

export default GamificationParticipation;
