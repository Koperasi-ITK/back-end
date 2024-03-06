'use strict';
module.exports = (sequelize, DataTypes) => {
  const TransaksiMetodePengiriman = sequelize.define('TransaksiMetodePengiriman', {
    transaksi_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Transaksi',
        key: 'id'
      }
    },
    metode_pengiriman_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'MetodePengiriman',
        key: 'id'
      }
    }
  }, {
    tableName: 'transaksimetodepengiriman',
    timestamps: false
  });
  return TransaksiMetodePengiriman;
};