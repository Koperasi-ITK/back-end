"use strict";
const { Model } = require("sequelize");

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
  Barang.init(
    {
      kategoriId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
      statusStokId: DataTypes.INTEGER,
      nama: DataTypes.STRING,
      harga: DataTypes.INTEGER,
      stok: DataTypes.INTEGER,
      urlGambar: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Barang",
    }
  );
  return Barang;
};
