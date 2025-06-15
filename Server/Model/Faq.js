import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Faq = sequelize.define('Faq', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reponse: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  categorieForm_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categoriesFormation',  
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'faq',
  timestamps: false,
});

export default Faq;
