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
      status_stok_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
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
