// Model/Magasin.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const magasin1 = sequelize.define('magasin1', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  // clé primaire technique auto-incrémentée
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,       // identifiant saisi par utilisateur, unique
  },
  nom_magasin: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  surface: {
    type: DataTypes.DECIMAL,   // surface en m2, par exemple
    allowNull: true,
  },
  longueur: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  largeur: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  zones_configurees: {
    type: DataTypes.TINYINT,    // zones configurées, peut être JSON ou texte
    allowNull: true,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'magasins',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_modification',
});

export default magasin1;
