import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const LigneCommandeAchat = sequelize.define('LigneCommandeAchat', {
  id_ligne_commande: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_commande_achat: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_produit: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  },
  montant_ligne: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false // à calculer manuellement en JS
  }
}, {
  tableName: 'ligne_commande_achat',
  timestamps: false
});

export default LigneCommandeAchat;
