// Model/Utilisateur.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import magasin1 from './magasin1.js';


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
    type: DataTypes.ENUM(
      'admin',
      'store_manager',
      'chef de rayon',
      'back_office_user',
      'seller',
      'cashier',
      'support_technician'
    ),
    allowNull: false,
  }
  ,
  
  entreprises_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {         
      model: magasin1,   
      key: 'magasin_id',         
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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
