// File: models/kategori.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
    static associate(models) {
      Kategori.hasMany(models.Barang, { foreignKey: 'kategori_id' });
    }
  }
  Kategori.init({
    kategori_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: { type: DataTypes.STRING, unique: true },
    potongan_penjualan: DataTypes.DECIMAL(10, 2),
  }, {
    sequelize,
    modelName: 'Kategori',
    tableName: 'kategori',
    timestamps: false
  });
  return Kategori;
};