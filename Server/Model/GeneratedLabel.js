import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Produit from './Produit.js';
import LabelTemplate from './LabelTemplate.js';

const GeneratedLabel = sequelize.define('GeneratedLabel', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  template_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: LabelTemplate,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  produit_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Produit,
      key: 'produit_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  label_data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: 'Contient les infos spécifiques affichées sur l’étiquette (prix, rayon, etc.)',
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  status: {
    type: DataTypes.ENUM('en_attente', 'imprimé'),
    defaultValue: 'en_attente',
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'generated_labels',
  timestamps: false,
});

export default GeneratedLabel;
