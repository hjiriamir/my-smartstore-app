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
      model: 'planogrammes',  
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
    allowNull: false,
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
    type: DataTypes.STRING, // ex: "implémentation", "validation", "Control", etc.
    allowNull: true,
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: false
});

export default Tache;
