import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Planogram = sequelize.define('Planogram', {
  planogram_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'zones',
      key: 'zone_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  update_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  statut: {
    type: DataTypes.ENUM('actif', 'inactif', 'en cours'),
    defaultValue: 'en cours',
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'planograms',
  timestamps: false,
});

export default Planogram;
