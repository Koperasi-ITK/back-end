'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: {
          name: "roleId",
          allowNull: false,
        },
      });
    }
  }
  Role.init(
    {
      roleName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "role",
      timestamps: false,
    }
  );
  return Role;
};
