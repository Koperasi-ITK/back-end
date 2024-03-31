"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {
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
      tableName: "kategori",
      timestamps: false,
    }
  );
  return Kategori;
};
