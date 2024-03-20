"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Saldo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Saldo.belongsTo(models.User, {
      //   foreignKey: "userId",
      // });
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
    }
  );
  return Saldo;
};
