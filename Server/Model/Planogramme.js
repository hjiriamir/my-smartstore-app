import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Planogramme = sequelize.define('Planogramme', {
  planogram_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'zone_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Type du planogramme (ex : mural, gondole, présentoir)',
  },
  largeur: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Largeur du planogramme en cm',
  },
  hauteur: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Hauteur du planogramme en cm',
  },
  nb_etageres: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Nombre d\'étagères',
  },
  nb_colonnes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Nombre de colonnes',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Description du planogramme',
  },
  create_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Date de création du planogramme',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Identifiant de l'utilisateur qui a créé le planogramme",
    references: {
      model: 'users',      
      key: 'id'            
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT'
  },
}, {
  tableName: 'planogrammes',
  timestamps: false,
});

export default Planogramme;
