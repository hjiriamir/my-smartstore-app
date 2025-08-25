// Model/Zone.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import magasins from './magasin1.js';

const Zone1 = sequelize.define('Zone1', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,       
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
  longueur: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Longueur de la zone (en mètres)',
  },
  largeur: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Largeur de la zone (en mètres)',
  },
  hauteur: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Hauteur de la zone (en mètres)',
  },
  temperature: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Température de la zone (en degrés Celsius)',
  },
  eclairage: {
    type: DataTypes.ENUM('LED', 'Incandescence', 'Fluorescent', 'Naturel', 'Halogène', 'Spot', 'Projecteur'),
    allowNull: true,
    comment: 'Type d\'éclairage',
  },
  position_x: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Coordonnée X de départ de la zone (en mètres depuis l’entrée)'
  },
  position_y: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Coordonnée Y de départ de la zone (en mètres depuis le mur gauche)'
  },
  orientation: {
    type: DataTypes.ENUM('Nord', 'Sud', 'Est', 'Ouest'),
    allowNull: true,
    comment: 'Orientation de la zone dans le magasin'
  },    
}, {
  tableName: 'zones',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_modification',
});

export default Zone1;
