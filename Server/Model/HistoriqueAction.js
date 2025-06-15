import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const HistoriqueAction = sequelize.define('HistoriqueAction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',  
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date_action: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'historique_actions',
  timestamps: false,
});

export default HistoriqueAction;
