// Model/Commentaire.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import Users from './Users.js';
import Tache from './Tache.js';
import Planogram from './Planogram.js';

const Commentaire = sequelize.define('commentaires', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type_commentaire: {
    type: DataTypes.ENUM('promo', 'reclamation', 'retour_magasin', 'autre'),
    allowNull: true,
    defaultValue: 'autre'
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  utilisateur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Users,
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  tache_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Tache,
      key: 'id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  planogram_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Planogram,
      key: 'planogram_id'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  piece_jointe_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lu: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: false
});

Commentaire.belongsTo(Users, { foreignKey: 'utilisateur_id', as: 'utilisateur' });
Commentaire.belongsTo(Tache, { foreignKey: 'tache_id', as: 'tache' });
Commentaire.belongsTo(Planogram, { foreignKey: 'planogram_id', as: 'planogram' });

export default Commentaire;
