import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Tache = sequelize.define('taches', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planogram_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'planograms',  
      key: 'planogram_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
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
  idUser: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  statut: {
    type: DataTypes.ENUM('à faire', 'en cours', 'terminé', 'en retard'),
    defaultValue: 'à faire',
  },
  date_debut: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  date_fin_prevue: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  date_fin_reelle: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  type: {
    type: DataTypes.ENUM(
      'mise_en_place',
      'controle',
      'audit',
      'reapprovisionnement',
      'nettoyage',
      'formation',
      'promotion',
      'maintenance',
      'remplacement_produit',
      'inspection',
      'autre'
    ),
    allowNull: false,
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  priorite: {
    type: DataTypes.ENUM(
      'Haute',
      'Basse',
      'Moyenne'
    ),
    allowNull: true,
  },
}, {
  timestamps: false
});

export default Tache;
