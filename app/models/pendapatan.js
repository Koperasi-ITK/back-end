"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Pendapatan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Pendapatan.belongsTo(models.Transaksi, {
        foreignKey: "transaksiId",
        as: "transaksi",
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });
    }
  }
  Pendapatan.init(
    {
      transaksiId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Transaksis', // nama tabel transaksi
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      shippingRevenue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      categoryRevenue: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Pendapatan",
      tableName: "Pendapatans",
      timestamps: true,  // Mengaktifkan createdAt dan updatedAt
    }
  );
  return Pendapatan;
};
