import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const LocalEvent = sequelize.define('LocalEvent', {
  event_id: {
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
  nom_event: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type_event: {
    type: DataTypes.ENUM(
      'festival',
      'compétition',
      'foire',
      'lancement_produit',
      'vente_flash',
      'atelier',
      'promotion_speciale',
      'journee_portes_ouvertes',
      'animation_enfant',
      'soirée_privée',
      'marathon_shopping',
      'festival_gastronomique',
      'salon',
      'expo',
      'collecte_solidaire'
    ),
    allowNull: false,
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  zone_geographique: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'local_events',
  timestamps: false,
});

export default LocalEvent;
