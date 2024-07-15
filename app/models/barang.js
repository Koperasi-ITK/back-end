"use strict";
const { Model, UUID, UUIDV4 } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Barang extends Model {
    static associate(models) {
      Barang.belongsTo(models.Kategori, {
        foreignKey: "kategoriId",
        allowNull: false,
      });
      Barang.belongsTo(models.statusStok, {
        foreignKey: "statusStokId",
        allowNull: false,
      });
      Barang.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Barang.belongsToMany(models.Transaksi, {
        through: models.detailTransaksi,
        foreignKey: "barangId",
        otherKey: "transaksiId",
      });
    }
  }

  Barang.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      kategoriId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      statusStokId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nama: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      harga: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      stok: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      urlGambar: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Barang",
    }
  );

  return Barang;
};
