import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const PointsProgram = sequelize.define('PointsProgram', {
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
  points_cumules: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  derniere_mise_a_jour: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'points_program',
  timestamps: false,
});

export default PointsProgram;
