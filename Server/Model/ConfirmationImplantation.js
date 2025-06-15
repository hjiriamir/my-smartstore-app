import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const ConfirmationImplantation = sequelize.define('confirmations_implantation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tache_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'taches',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  date_confirmation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  photo_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  commentaire: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM('conforme', 'non conforme', 'à revoir'),
    allowNull: false,
  }
}, {
  timestamps: false
});

export default ConfirmationImplantation;
