import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const PlanogrammeDetail = sequelize.define('PlanogrammeDetail', {
  planogram_detail_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  planogram_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'planogrammes',  // nom exact de la table Planogramme
      key: 'planogram_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  produit_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'produits',
      key: 'produit_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  position_prod_etagere: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  position_prod_colonne: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'planogramme_details',
  timestamps: false,
});

export default PlanogrammeDetail;
