import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js'; 

const Produit = sequelize.define('Produit', {
  produit_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  prix: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  categorie_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    // Clé étrangère supprimée
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'produit',  
  timestamps: false      
});

export default Produit;
