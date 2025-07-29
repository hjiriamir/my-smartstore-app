import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import zone1 from './zone1.js';

const ZoneVisites = sequelize.define('ZoneVisites', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: zone1,
      key: 'zone_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  date_visite: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Date de comptage des visiteurs',
  },
  nb_visiteurs: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'zone_visites',
  timestamps: true,
  createdAt: 'date_creation',
  updatedAt: 'date_modification',
});



export default ZoneVisites;
