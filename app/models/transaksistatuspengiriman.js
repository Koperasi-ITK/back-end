'use strict';
module.exports = (sequelize, DataTypes) => {
  const TransaksiStatusPengiriman = sequelize.define('TransaksiStatusPengiriman', {
    transaksi_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Transaksi',
        key: 'id'
      }
    },
    status_pengiriman_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'StatusPengiriman',
        key: 'id'
      }
    }
  }, {
    tableName: 'transaksistatuspengiriman',
    timestamps: false
  });
  return TransaksiStatusPengiriman;
};