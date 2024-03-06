// File: models/saldo.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Saldo extends Model {
    static associate(models) {
      Saldo.belongsTo(models.Users, { foreignKey: 'user_id' });
    }
  }
  Saldo.init({
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    saldo_iuran_wajib: DataTypes.DECIMAL(10, 2),
    saldo_iuran_sukarela: DataTypes.DECIMAL(10, 2),
    saldo_penjualan: DataTypes.DECIMAL(10, 2),
  }, {
    sequelize,
    modelName: 'Saldo',
    tableName: 'saldo',
    timestamps: false
  });
  return Saldo;
};
