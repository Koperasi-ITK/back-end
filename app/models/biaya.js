"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Biaya extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Definisikan relasi di sini jika diperlukan
    }
  }
  Biaya.init(
    {
      BiayaAntar: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      BiayaIuranBulanan: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Biaya",
    }
  );
  return Biaya;
};
