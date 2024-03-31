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
      barangId: DataTypes.INTEGER,
      keranjangId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      jumlah: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "itemKeranjang",
    }
  );
  return itemKeranjang;
};
