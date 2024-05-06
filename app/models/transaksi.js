"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transaksi extends Model {
    static associate(models) {
      Transaksi.belongsTo(models.User, {
        foreignKey: "userId",
      });
      Transaksi.belongsTo(models.metodePengiriman, {
        foreignKey: "metodePengirimanId",
        allowNull: false,
      });
      Transaksi.belongsTo(models.statusPengiriman, {
        foreignKey: "statusPengirimanId",
        allowNull: false,
      });
      Transaksi.belongsToMany(models.Barang, {
        through: models.detailTransaksi,
        foreignKey: "transaksiId",
        otherKey: "barangId",
      });
      Transaksi.hasMany(models.detailTransaksi, 
        { foreignKey: 'transaksiId' 
      });
    }
  }
  Transaksi.init(
    {
      userId: DataTypes.INTEGER,
      metodePengirimanId: DataTypes.INTEGER,
      statusPengirimanId: DataTypes.INTEGER,
      totalHarga: DataTypes.INTEGER,
      waktuPengambilan: DataTypes.DATE,
      alamatPengiriman: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Transaksi",
    }
  );
  return Transaksi;
};
