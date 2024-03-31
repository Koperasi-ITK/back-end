"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Saldo extends Model {
    static associate(models) {
      Saldo.belongsTo(models.User, {
        foreignKey: "userId",
      });
    }
  }
  Saldo.init(
    {
      userId: DataTypes.INTEGER,
      saldoIuranWajib: DataTypes.INTEGER,
      saldoIuranSukarela: DataTypes.INTEGER,
      saldoPenjualan: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Saldo",
      tableName: "saldo",
      timestamps: false,
    }
  );
  return Saldo;
};
