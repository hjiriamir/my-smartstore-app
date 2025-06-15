import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js'; // adapte selon ta config

const CategorieFormation = sequelize.define('CategorieFormation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'categoriesFormation',
  timestamps: false,
});

export default CategorieFormation;
