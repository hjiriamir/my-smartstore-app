import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Fournisseur = sequelize.define('Fournisseur', {
  fournisseur_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ville: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  code_postal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  pays: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  contact_principal: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  siret: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_creation: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'fournisseurs',
  timestamps: false,
});

export default Fournisseur;
