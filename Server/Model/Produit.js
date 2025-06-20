// Model/Produit.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Fournisseur from './Fournisseur.js';
const Produit = sequelize.define('Produit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  produit_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  prix: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  categorie_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'categories',       
      key: 'categorie_id'       
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  fournisseur_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'fournisseurs',       
      key: 'fournisseur_id'       
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
  // Dimensions physiques
  longueur: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Longueur du produit (en cm)',
  },
  conditionnement: {
    type: DataTypes.STRING,
    allowNull: true,
},
  largeur: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Largeur du produit (en cm)',
  },
  hauteur: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Hauteur du produit (en cm)',
  },
  poids: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Poids du produit (en kg)',
  },

  // Attributs stratégiques
  saisonnalite: {
    type: DataTypes.ENUM('Hiver', 'Printemps', 'Été', 'Automne', 'Toute saison'),
    allowNull: true,
    comment: 'Saisonnalité du produit',
  },
  priorite_merchandising: {
    type: DataTypes.ENUM('Haute', 'Moyenne', 'Basse'),
    allowNull: true,
    comment: 'Niveau de priorité pour le merchandising',
  },
  
  contrainte_temperature: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Contraintes de température pour l\'exposition',
  },
  contrainte_conditionnement: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Contraintes de conditionnement pour l\'exposition',
  },

  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'produits',
  timestamps: false,
});

export default Produit;
