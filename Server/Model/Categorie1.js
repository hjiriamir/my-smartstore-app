import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';
import magasin1 from './magasin1.js';

const Categorie1 = sequelize.define('Categorie', {
    // Clé primaire auto-incrémentée
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    // Identifiant unique fourni par l'utilisateur
    categorie_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parent_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    niveau: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    saisonnalite: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    priorite: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    zone_exposition_preferee: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    temperature_exposition: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clientele_ciblee: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    magasin_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {         // déclaration FK
        model: magasin1,    // table référencée
        key: 'magasin_id',         // colonne référencée (clé primaire Magasin)
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    }
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'date_creation',
    updatedAt: 'date_modification',
});

export default Categorie1;
