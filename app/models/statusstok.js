"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class statusStok extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // statusStok.hasMany(models.Barang, {
      //   foreignKey: "statusStokId",
      // });
    }
  }
  statusStok.init(
    {
      statusStok: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "statusStok",
    }
  );
  return statusStok;
};
