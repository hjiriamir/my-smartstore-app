// Model/Zone.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import magasins from './magasin1.js';

const Zone1 = sequelize.define('Zone1', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // clé primaire technique auto-incrémentée
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,       // zone_id saisi par utilisateur, unique
  },
  nom_zone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  magasin_id: {
    type: DataTypes.STRING(255),  // même longueur explicite que magasins
    allowNull: true,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  emplacement: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'zones',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_modification',
});

export default Zone1;
