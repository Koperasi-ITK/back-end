"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class statusPengiriman extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
      modelName: "statusPengiriman",
    }
  );
  return statusPengiriman;
};
