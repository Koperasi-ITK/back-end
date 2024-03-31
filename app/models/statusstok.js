"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class statusStok extends Model {
    static associate(models) {
      statusStok.hasMany(models.Barang, {
        foreignKey: "statusStokId",
      });
    }
  }

  statusStok.init(
    {
      status_stok_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "StatusStok",
      tableName: "statusstok",
      timestamps: false,
    }
  );

  return statusStok;
};
