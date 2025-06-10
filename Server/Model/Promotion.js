import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Promotion = sequelize.define('Promotion', {
  promotion_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom_promotion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type_promotion: {
    type: DataTypes.ENUM('remise %', 'remise fixe', 'offre spéciale', 'bundle', 'livraison gratuite'),
    allowNull: false,
  },
  produit_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'produits',
      key: 'produit_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  categorie_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'categorie_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  etat: {
    type: DataTypes.ENUM('active', 'planifiée', 'terminée'),
    allowNull: false,
    defaultValue: 'planifiée',
  },
  conditions: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'promotions',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_modification',
});

export default Promotion;
