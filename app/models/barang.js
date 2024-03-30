"use strict";
const { Model, INTEGER } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
