// models/EntrepriseFournisseur.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const EntrepriseFournisseur = sequelize.define('EntrepriseFournisseur', {
  entrepriseId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'entreprises',
      key: 'id',
    },
  },
  fournisseurId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'fournisseurs',
      key: 'fournisseur_id',
    },
  },
}, {
  tableName: 'entreprise_fournisseurs',
  timestamps: false,
});

export default EntrepriseFournisseur;
