// models/riwayatpencairan.js
"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RiwayatPencairan extends Model {
    static associate(models) {
      RiwayatPencairan.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  RiwayatPencairan.init(
    {
      userId: DataTypes.INTEGER,
      jumlahPencairan: DataTypes.INTEGER,
      tanggalPencairan: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "RiwayatPencairan",
    }
  );
  return RiwayatPencairan;
};
