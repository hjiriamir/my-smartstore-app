// models/demandeAbonnement.js
import { DataTypes } from 'sequelize';
import sequelize from '../Config/database1.js';

const DemandeAbonnement = sequelize.define('DemandeAbonnement', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    prenom: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    entreprise: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telephone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    commentaire: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    titre_post: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    prix_abonnement: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    date_debut: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    date_fin: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    forfait: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('Refuser', 'Accepter', 'En attente'),
        allowNull: false,
        defaultValue: 'en attente'
    }
}, {
    tableName: 'demande_abonnements',
    timestamps: true, // createdAt et updatedAt automatiques
    indexes: [
        {
            unique: true,   // true = unicité, chaque email doit avoir une seul abonnement 
            fields: ['email']
        }
    ]
});

export default DemandeAbonnement;
