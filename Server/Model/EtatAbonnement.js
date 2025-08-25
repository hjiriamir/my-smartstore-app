// models/EtatAbonnement.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Entreprises from './Entreprises.js';

const EtatAbonnement = sequelize.define('EtatAbonnement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  entreprise_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'entreprises',
      key: 'id'
    }
  },
  type_forfait: {
    type: DataTypes.ENUM('basic', 'advanced', 'gold'),
    allowNull: false
  },
  date_acceptation: {
    type: DataTypes.DATE,
    allowNull: false
  },
  date_fin: {
    type: DataTypes.DATE,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'suspendu'),
    allowNull: false,
    defaultValue: 'actif'
  }
}, {
  tableName: 'etat_abonnement',
  timestamps: true,
});



export default EtatAbonnement;
