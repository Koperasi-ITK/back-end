'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatusStok extends Model {
    static associate(models) {
      statusStok.hasMany(models.Barang, {
        foreignKey: "statusStokId",
      });
    }
  }

  StatusStok.init({
    status_stok_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    status_stok_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StatusStok',
    tableName: 'statusstok',
    timestamps: false
  });

  return StatusStok;
};
