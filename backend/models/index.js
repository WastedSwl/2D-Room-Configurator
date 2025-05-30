'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

// Загружаем настройки подключения из .env (предпочтительно) или config.json
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbLogging = process.env.DB_LOGGING === 'true';

const db = {};

let sequelize;
if (dbHost && dbUser && dbName) { // Проверяем наличие основных переменных
  sequelize = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql', // Явно указываем диалект
    logging: dbLogging ? console.log : false,
    dialectOptions: {
      connectTimeout: 60000, // Таймаут подключения
    }
  });
} else {
  // Резервный вариант: если переменные окружения не заданы, попытаться использовать config.json
  // Это менее предпочтительно, так как .env должен быть основным источником конфигурации
  console.warn("Database environment variables (DB_HOST, DB_USER, DB_NAME, DB_PASS) are not fully set. Falling back to config.json if available.");
  const configPath = path.join(__dirname, '/../config/config.json');
  if (fs.existsSync(configPath)) {
    const config = require(configPath)[env];
    if (config && config.database && config.username) {
        sequelize = new Sequelize(config.database, config.username, config.password, config);
    } else {
        throw new Error('Database configuration is incomplete in both .env and config.json for environment: ' + env);
    }
  } else {
    throw new Error('Database configuration file (config.json) not found and .env variables are not set.');
  }
}


fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Передаем инстанс sequelize и конструктор DataTypes
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;