"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class statusAnggota extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // statusAnggota.hasOne(models.User, {
      //   foreignKey: "statusAnggotaId",
      // });
    }
  }
  statusAnggota.init(
    {
      statusName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "statusAnggota",
    }
  );
  return statusAnggota;
};
