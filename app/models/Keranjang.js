// File: models/keranjang.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Keranjang extends Model {
    static associate(models) {
      Keranjang.belongsTo(models.Users, { foreignKey: 'user_id' });
      Keranjang.hasMany(models.ItemKeranjang, { foreignKey: 'keranjang_id' });
    }
  }
  Keranjang.init({
    keranjang_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Keranjang',
    tableName: 'keranjang',
    timestamps: false
  });
  return Keranjang;
};
