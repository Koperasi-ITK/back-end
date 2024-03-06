'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GambarBarang extends Model {
    static associate(models) {
      GambarBarang.belongsTo(models.Barang, { foreignKey: 'barang_id' });
    }
  }
  GambarBarang.init({
    gambar_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    barang_id: DataTypes.INTEGER,
    url_gambar: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'GambarBarang',
    tableName: 'gambarbarang',
    timestamps: false
  });
  return GambarBarang;
};
