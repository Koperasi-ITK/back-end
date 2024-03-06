'use strict';
module.exports = (sequelize, DataTypes) => {
  const BarangStatusStok = sequelize.define('BarangStatusStok', {
    barang_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Barang',
        key: 'id'
      }
    },
    status_stok_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'StatusStok',
        key: 'id'
      }
    }
  }, {
    tableName: 'barangstatusstok',
    timestamps: false
  });
  return BarangStatusStok;
};