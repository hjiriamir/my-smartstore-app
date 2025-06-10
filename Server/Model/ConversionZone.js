import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const ConversionZone = sequelize.define('ConversionZone', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'zones',  
      key: 'zone_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  visiteurs: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  acheteurs: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  taux_conversion: {
    type: DataTypes.DECIMAL(5, 4), // précision : 4 chiffres après la virgule
    allowNull: false,
    
  },
}, {
  tableName: 'conversion_zone',
  timestamps: false,
});

export default ConversionZone;
