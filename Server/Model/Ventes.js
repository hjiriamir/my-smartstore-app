import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const Vente = sequelize.define('Vente', {
  vente_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  produit_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'produits',
      key: 'produit_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
  },
  date_vente: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  prix_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  montant_total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'ventes',
  timestamps: false,
});

export default Vente;
