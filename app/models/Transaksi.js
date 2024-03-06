// File: models/transaksi.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transaksi extends Model {
    static associate(models) {
      Transaksi.belongsTo(models.Users, { foreignKey: 'user_id' });
      Transaksi.belongsToMany(models.StatusPengiriman, {
        through: 'TransaksiStatusPengiriman',
        foreignKey: 'transaksi_id',
        otherKey: 'status_pengiriman_id'
      });
      Transaksi.belongsToMany(models.MetodePengiriman, {
        through: 'TransaksiMetodePengiriman',
        foreignKey: 'transaksi_id',
        otherKey: 'metode_pengiriman_id'
      });
      Transaksi.belongsToMany(models.Barang, {
        through: models.DetailTransaksi,
        foreignKey: 'transaksi_id',
        otherKey: 'barang_id'
      });
    }
  }
  Transaksi.init({
    transaksi_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    total_harga: DataTypes.DECIMAL(10, 2),
    batas_waktu_pengambilan: DataTypes.DATE,
    alamat_pengiriman: DataTypes.STRING,
    tanggal_transaksi: DataTypes.DATEONLY,
    waktu_transaksi: DataTypes.TIME,
  }, {
    sequelize,
    modelName: 'Transaksi',
    tableName: 'transaksi',
    timestamps: false
  });
  return Transaksi;
};