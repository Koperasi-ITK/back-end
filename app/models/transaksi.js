"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaksi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
