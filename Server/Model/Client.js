import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js'; 

const Client = sequelize.define('Client', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  code_client: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  prenom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ville: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entreprise_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pays: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  genre: {
    type: DataTypes.ENUM('homme', 'femme'),
    allowNull: true,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'clients',
  timestamps: false, 
});

export default Client;
