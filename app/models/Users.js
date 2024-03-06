// File: models/users.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.belongsToMany(models.Role, { through: 'User_Role', foreignKey: 'user_id' });
      Users.hasOne(models.Saldo, { foreignKey: 'user_id' });
      Users.hasMany(models.Transaksi, { foreignKey: 'user_id' });
      Users.hasMany(models.Keranjang, { foreignKey: 'user_id' });
      Users.belongsToMany(models.StatusKeanggotaan, { through: 'UserStatus', foreignKey: 'user_id',as: 'Statuses' });
    }
  }
  Users.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password_hash: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'users',
    timestamps: false
  });
  return Users;
};
