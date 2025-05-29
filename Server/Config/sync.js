import sequelize from './database1.js'; 
import Categorie from '../Model/Categorie1.js';
import Produit from '../Model/Produit.js';

(async () => {
  try {
    await sequelize.sync({ force: false }); // ou { alter: true }
    console.log("Base de données synchronisée avec le modèle Categorie !");
  } catch (error) {
    console.error("Erreur de synchronisation :", error);
  }
})();
