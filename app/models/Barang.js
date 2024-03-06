'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    static associate(models) {
      Barang.belongsTo(models.Kategori, { foreignKey: 'kategori_id' });
      Barang.belongsTo(models.Users, { foreignKey: 'user_id' });
      Barang.hasMany(models.GambarBarang, { foreignKey: 'barang_id' });
      Barang.belongsToMany(models.StatusStok, {
        through: 'BarangStatusStok',
        foreignKey: 'barang_id',
        otherKey: 'status_stok_id'
      });
      Barang.belongsToMany(models.Transaksi, {
        through: models.DetailTransaksi,
        foreignKey: 'barang_id',
        otherKey: 'transaksi_id'
      });
    }
  }
  Barang.init({
    barang_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kategori_id: DataTypes.INTEGER,
    nama: DataTypes.STRING,
    harga: DataTypes.DECIMAL(10, 2),
    stok: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Barang',
    tableName: 'barang',
    timestamps: false
  });
  return Barang;
};