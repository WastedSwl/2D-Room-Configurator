'use strict';
const { Model, DataTypes } = require('sequelize'); // DataTypes импортируется из sequelize
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => { // Sequelize инстанс передается напрямую
  class User extends Model {
    static associate(models) {
      // define association here if needed in the future
    }

    // Метод для проверки пароля
    async isValidPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  User.init({
    id: { // Явно определим id, если хотим контролировать его тип
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    }
    // Sequelize автоматически добавит createdAt и updatedAt, если не указано timestamps: false
  }, {
    sequelize,
    modelName: 'User', // Имя модели в JavaScript остается 'User'
    tableName: 'Configurator-AUTH', // <--- ВОТ ЗДЕСЬ УКАЗЫВАЕМ ИМЯ ТАБЛИЦЫ В БД
    timestamps: true, // Явно указываем, что временные метки нужны (по умолчанию true)
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        // Проверяем, было ли изменено поле password
        if (user.changed('password') && user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};