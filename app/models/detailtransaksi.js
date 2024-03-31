'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetailTransaksi extends Model {
    static associate(models) {
      detailTransaksi.belongsTo(models.Transaksi, {
        foreignKey: "transaksiId",
      });
      detailTransaksi.belongsTo(models.Barang, {
        foreignKey: "barangId",
      });
    }
  }
  DetailTransaksi.init({
    transaksi_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    barang_id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    jumlah: DataTypes.INTEGER,
    harga_per_item: DataTypes.DECIMAL(10, 2),
    total_harga: DataTypes.DECIMAL(10, 2)
  }, {
    sequelize,
    modelName: 'DetailTransaksi',
    tableName: 'detailtransaksi',
    timestamps: false
  });
  return DetailTransaksi;
};
