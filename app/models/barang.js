'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    static associate(models) {
      Barang.belongsTo(models.Kategori, {
        foreignKey: "kategoriId",
        allowNull: false,
      });
      Barang.belongsTo(models.statusStok, {
        foreignKey: "statusStokId",
        allowNull: false,
      });
      Barang.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Barang.belongsToMany(models.Transaksi, {
        through: models.detailTransaksi,
        foreignKey: "barangId",
        otherKey: "transaksiId",
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