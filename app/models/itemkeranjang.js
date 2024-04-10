"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class itemKeranjang extends Model {
    static associate(models) {
      itemKeranjang.belongsTo(models.Barang, {
        foreignKey: "barangId",
      });
      itemKeranjang.belongsTo(models.Keranjang, {
        foreignKey: "keranjangId",
      });
    }
  }
  itemKeranjang.init(
    {
      keranjang_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      barang_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
      jumlah: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "itemKeranjang",
    }
  );
  return itemKeranjang;
};
