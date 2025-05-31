// Model/Utilisateur.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js'; // adapte selon ton chemin

const Users = sequelize.define('Users', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'seller', 'cashier'),
    allowNull: false,
  },
  
  entreprises_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true,  
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true, 
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Users;
