'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatusKeanggotaan extends Model {
    static associate(models) {
      StatusKeanggotaan.belongsToMany(models.Users, { through: 'UserStatus', foreignKey: 'status_id', as: 'Users' });
    }
  }
  StatusKeanggotaan.init({
    status_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    status_name: { type: DataTypes.STRING, unique: true }
  }, {
    sequelize,
    modelName: 'StatusKeanggotaan',
    tableName: 'statuskeanggotaan',
    timestamps: false
  });
  return StatusKeanggotaan;
};
