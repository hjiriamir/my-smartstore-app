import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const LegalConstraint = sequelize.define('LegalConstraint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  categorie_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'categorie_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type_contrainte: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  conditions: {
    type: DataTypes.STRING, 
    allowNull: true,
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'legal_constraints',
  timestamps: false,
});

export default LegalConstraint;
