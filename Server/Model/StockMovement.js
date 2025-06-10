import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const StockMovement = sequelize.define('StockMovement', {
  mouvement_id: {
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
  date_mouvement: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type_mouvement: {
    type: DataTypes.ENUM('entrée', 'sortie'),
    allowNull: false,
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cout_unitaire: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  valeur_mouvement: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  reference_doc: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'stock_movements',
  timestamps: false,
});

export default StockMovement;
