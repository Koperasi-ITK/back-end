"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Kategori.hasMany(models.Barang, {
        foreignKey: "kategoriId",
        allowNull: false,
      });
    }
  }
  Kategori.init(
    {
      namaKategori: DataTypes.STRING,
      image: DataTypes.STRING,
      potonganHarga: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Kategori",
    }
  );
  return Kategori;
};
