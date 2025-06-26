import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Faq = sequelize.define('Faq', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reponse: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  vues: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  personnes_aidees: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
  ,
  categorie : {
    type: DataTypes.ENUM('Visualisation', 'Technique', 'Validation', 'Export', 'Formation', 'Connexion', 'Notifications', 'Parametrage', 'Support', 'Divers'),
    defaultValue: 'Divers',
  },
  entreprise_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'entreprises',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'faq',
  timestamps: false,
});

export default Faq;
