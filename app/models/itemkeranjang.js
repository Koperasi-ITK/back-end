"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class itemKeranjang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      itemKeranjang.belongsTo(models.Barang, {
        foreignKey: 'barangId',
      });
      itemKeranjang.belongsTo(models.Keranjang, {
        foreignKey: 'keranjangId',
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
