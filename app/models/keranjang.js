'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Keranjang extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Keranjang.belongsTo(models.User, {
        foreignKey: 'userId',
      });
      Keranjang.hasMany(models.itemKeranjang, {
        foreignKey: 'keranjangId',
      });
    }
  }
  Keranjang.init({
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Keranjang',
  });
  return Keranjang;
};