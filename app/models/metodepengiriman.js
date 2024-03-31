"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class metodePengiriman extends Model {
    static associate(models) {
      metodePengiriman.hasMany(models.Transaksi, {
        foreignKey: "metodePengirimanId",
      });
    }
  }
  metodePengiriman.init(
    {
      metodePengirimanName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "MetodePengiriman",
      tableName: "metodepengiriman",
      timestamps: false,
    }
  );
  return metodePengiriman;
};
