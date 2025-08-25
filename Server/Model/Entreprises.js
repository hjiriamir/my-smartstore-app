// models/Entreprises.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Entreprises = sequelize.define('Entreprises', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomEntreprise: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  informations_abonnement: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'entreprises',
  timestamps: false, 
});

export default Entreprises;
