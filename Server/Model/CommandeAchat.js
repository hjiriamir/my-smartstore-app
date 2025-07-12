import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const CommandeAchat = sequelize.define('CommandeAchat', {
  id_commande_achat: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  reference: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  id_fournisseur: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_entreprise: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_magasin: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_commande: {
    type: DataTypes.DATE,
    allowNull: false
  },
  statut: {
    type: DataTypes.ENUM('draft ', 'approved', 'sent ', 'invoiced', 'cancelled'),
    defaultValue: 'Draft'
  },
  canal: {
    type: DataTypes.ENUM('Direct_Supplier ', 'Supplier_Portal', 'E-Procurement ', 'EDI', 'Purchase_Agent','Phone', 'Email', 'Marketplaces_B2B','In-Person'),
    defaultValue: 'Direct_Supplier',


  },
  date_livraison_prevue: {
    type: DataTypes.DATEONLY
  },
  date_livraison_reelle: {
    type: DataTypes.DATEONLY
  },
  montant_total: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  commentaire: {
    type: DataTypes.TEXT
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'commande_achat',
  timestamps: false
});

export default CommandeAchat;
