import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('store_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Optionnel : désactiver les logs SQL dans la console
});

export default sequelize;
