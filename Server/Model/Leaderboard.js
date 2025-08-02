import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Leaderboard = sequelize.define('Leaderboard', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clients',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  points_total: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  points_disponible: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  rang: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'leaderboard',
  timestamps: false,
});

export default Leaderboard;
