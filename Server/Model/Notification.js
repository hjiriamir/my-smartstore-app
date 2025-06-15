import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Users from './Users.js';

const Notification = sequelize.define('notifications', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {         
      model: Users,   
      key: 'id',         
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  type: {
    type: DataTypes.ENUM('nouveau planogramme', 'retard', 'message', 'autre'),
    allowNull: false
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date_envoi: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

export default Notification;
