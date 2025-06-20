import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const ProductPosition = sequelize.define('ProductPosition', {
  position_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  furniture_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'furniture',
      key: 'furniture_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'produits',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  face: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  etagere: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  colonne: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: false,
  tableName: 'ProductPosition',
});

export default ProductPosition;
