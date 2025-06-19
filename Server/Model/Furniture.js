  import { DataTypes } from 'sequelize';
  import sequelize from '../Config/database1.js';

  const Furniture = sequelize.define('Furniture', {
    furniture_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    planogram_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'planograms',  // nom exact de la table Planogramme 
        key: 'planogram_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    furniture_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'furnituretypes',  // nom exact de la table FurnitureType 
        key: 'furniture_type_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
  },
  largeur: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  hauteur: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  profondeur: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },

  nb_colonnes_unique_face: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nb_etageres_unique_face: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nb_colonnes_front_back: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nb_etageres_front_back: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nb_colonnes_left_right: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nb_etageres_left_right: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pdfUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    timestamps: false,
  });

  export default Furniture;
