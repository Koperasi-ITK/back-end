// models/logging.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Logging extends Model {
    static associate(models) {
      Logging.belongsTo(models.User, {
        foreignKey: 'userId',
      });
    }
  }
  Logging.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
    },
    tanggal: {
      type: DataTypes.DATE,
    },
    waktu: {
      type: DataTypes.TIME,
      field: 'Waktu'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Logging',
  });
  return Logging;
};
