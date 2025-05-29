import Sequelize from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connexion Sequelize à la base de données
export const sequelize = new Sequelize(
  process.env.DB_NAME || 'store_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
  }
);

// Objet pour stocker les modèles
const db = {};

// Lire tous les fichiers .js du dossier Model (sauf index.js)
fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js')
  .forEach(file => {
    const model = require(path.join(__dirname, file));
    const modelInstance = model.default(sequelize, Sequelize.DataTypes);
    db[modelInstance.name] = modelInstance;
  });

// Appliquer les associations entre modèles s’il y en a
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export des modèles et instance Sequelize
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
