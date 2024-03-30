"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class detailTransaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      detailTransaksi.belongsTo(models.Transaksi, {
        foreignKey: "transaksiId",
      });
      detailTransaksi.belongsTo(models.Barang, {
        foreignKey: "barangId",
      });
    }
  }
  detailTransaksi.init(
    {
      transaksiId: DataTypes.INTEGER,
      barangId: DataTypes.INTEGER,
      jumlah: DataTypes.INTEGER,
      hargItem: DataTypes.INTEGER,
      totalHarga: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "detailTransaksi",
    }
  );
  return detailTransaksi;
};
