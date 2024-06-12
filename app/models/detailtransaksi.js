"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class detailTransaksi extends Model {
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
      barangId: DataTypes.UUID,
      jumlah: DataTypes.INTEGER,
      hargaItem: DataTypes.INTEGER,
      totalHarga: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "detailTransaksi",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );
  return detailTransaksi;
};
