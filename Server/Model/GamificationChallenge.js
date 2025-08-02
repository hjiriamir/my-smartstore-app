import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js'; 

const GamificationChallenge = sequelize.define('GamificationChallenge', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM('chasse_tresor', 'points', 'quiz', 'mission'),
    allowNull: false,
    comment: 'Type du challenge : chasse_tresor, points, quiz, mission'
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  recompense: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  magasin_id: {             
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'magasins',     
      key: 'id',            
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',    
  },
}, {
  tableName: 'gamification_challenges',
  timestamps: false,
});

export default GamificationChallenge;
