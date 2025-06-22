// models/Session.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Users from './Users.js';

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Sessions',
  timestamps: true, // createdAt et updatedAt
});

Users.hasMany(Session, { foreignKey: 'userId' });
Session.belongsTo(Users, { foreignKey: 'userId' });

export default Session;
