'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MetodePengiriman extends Model {
    static associate(models) {
      MetodePengiriman.belongsToMany(models.Transaksi, {
        through: 'TransaksiMetodePengiriman',
        foreignKey: 'metode_pengiriman_id',
        otherKey: 'transaksi_id'
      });
    }
  }
  MetodePengiriman.init({
    metode_pengiriman_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    metode_pengiriman_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'MetodePengiriman',
    tableName: 'metodepengiriman',
    timestamps: false
  });
  return MetodePengiriman;
};