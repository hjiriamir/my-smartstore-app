import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const SupplierAgreement = sequelize.define('SupplierAgreement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fournisseur_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'fournisseurs',
      key: 'fournisseur_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  categorie_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'categorie_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  magasin_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'magasins',
      key: 'magasin_id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  },
  placement_exige: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  espace_minimum: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  date_debut: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  date_fin: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  tableName: 'supplier_agreements',
  timestamps: false,
});

export default SupplierAgreement;
