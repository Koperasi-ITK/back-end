'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class statusPengiriman extends Model {
    static associate(models) {
     statusPengiriman.hasMany(models.Transaksi, {
       foreignKey: "statusPengirimanId",
     });
    }
  }
  statusPengiriman.init(
    {
      statusPengirimanName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "StatusPengiriman",
      tableName: "statuspengiriman",
      timestamps: false,
    }
  );
  return statusPengiriman;
};