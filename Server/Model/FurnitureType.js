import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const FurnitureType = sequelize.define('FurnitureType', {
  furniture_type_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nomType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nombreFaces: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  timestamps: false,
  tableName: 'furnitureTypes'
});

export default FurnitureType;
