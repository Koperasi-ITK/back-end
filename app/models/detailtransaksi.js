'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetailTransaksi extends Model {
    static associate(models) {
      DetailTransaksi.belongsTo(models.Transaksi, { foreignKey: 'transaksi_id' });
      DetailTransaksi.belongsTo(models.Barang, { foreignKey: 'barang_id' });
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
