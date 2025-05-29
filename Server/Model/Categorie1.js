export default (sequelize, DataTypes) => {
    const Categorie1= sequelize.define('Categorie1', {
      categorie_id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      parent_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'Categorie1',
          key: 'categorie_id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      niveau: DataTypes.STRING,
      saisonnalite: DataTypes.STRING,
      priorite: DataTypes.STRING,
      zone_exposition_preferee: DataTypes.STRING,
      temperature_exposition: DataTypes.STRING,
      conditionnement: DataTypes.STRING,
      clientele_ciblee: DataTypes.STRING,
      magasin_id: DataTypes.STRING,
      date_creation: DataTypes.DATE,
      date_modification: DataTypes.DATE,
    }, {
      tableName: 'categorie1',
      timestamps: false, 
    });
  
    // ajouter des associations avec d'autres modèles :
    Categorie.associate = (models) => {
      Categorie.belongsTo(models.Categorie, {
        foreignKey: 'parent_id',
        as: 'parent',
      });
  
      Categorie.hasMany(models.Categorie, {
        foreignKey: 'parent_id',
        as: 'subcategories',
      });
    };
  
    return Categorie1;
  };
  