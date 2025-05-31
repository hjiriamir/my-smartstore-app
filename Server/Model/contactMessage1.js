import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const contactMessage1 = sequelize.define('contactMessage1', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'messages_contact',
  timestamps: false,  
});

export default contactMessage1;
