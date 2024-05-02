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
      statusStok: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "StatusStok",
    }
  );

  return statusStok;
};
