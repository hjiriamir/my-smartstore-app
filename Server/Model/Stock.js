import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Stock = sequelize.define('Stock', {
  produit_id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
  },
  magasin_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  date_maj: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'stock',
  timestamps: false,
});

export default Stock;
