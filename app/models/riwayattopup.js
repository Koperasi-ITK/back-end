"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RiwayatTopup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      RiwayatTopup.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  RiwayatTopup.init(
    {
      userId: DataTypes.INTEGER,
      saldoIuranWajib: DataTypes.INTEGER,
      saldoIuranSukarela: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "RiwayatTopup",
    }
  );
  return RiwayatTopup;
};
