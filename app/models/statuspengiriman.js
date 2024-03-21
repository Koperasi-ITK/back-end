'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatusPengiriman extends Model {
    static associate(models) {
      StatusPengiriman.belongsToMany(models.Transaksi, {
        through: 'TransaksiStatusPengiriman',
        foreignKey: 'status_pengiriman_id',
        otherKey: 'transaksi_id'
      });
    }
  }
  StatusPengiriman.init({
    status_pengiriman_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status_pengiriman_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StatusPengiriman',
    tableName: 'statuspengiriman',
    timestamps: false
  });
  return StatusPengiriman;
};