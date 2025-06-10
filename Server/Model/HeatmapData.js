import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const HeatmapData = sequelize.define('HeatmapData', {
  id: {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  visiteurs: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duree_moyenne: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
  intensite: {
    type: DataTypes.DECIMAL,
    allowNull: true,
  },
}, {
  tableName: 'heatmap_data',
  timestamps: false,
});

export default HeatmapData;
