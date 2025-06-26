import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js'; // adapter selon ta config

const Formation = sequelize.define('Formation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  titre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  url_video: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url_pdf: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  entreprise_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'entreprises',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  duree: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  date_creation: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'formations',
  timestamps: false, // puisque tu as date_creation manuel
});

export default Formation;
