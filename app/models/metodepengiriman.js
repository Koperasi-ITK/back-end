"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class metodePengiriman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
      modelName: "metodePengiriman",
    }
  );
  return metodePengiriman;
};
