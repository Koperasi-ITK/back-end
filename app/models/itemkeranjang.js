'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ItemKeranjang extends Model {
    static associate(models) {
      ItemKeranjang.belongsTo(models.Keranjang, { foreignKey: 'keranjang_id' });
      ItemKeranjang.belongsTo(models.Barang, { foreignKey: 'barang_id' });
    }
  }
  ItemKeranjang.init({
    keranjang_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    barang_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    jumlah: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ItemKeranjang',
    tableName: 'itemkeranjang',
    timestamps: false
  });
  return ItemKeranjang;
};
