'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.Users, { through: 'User_Role', foreignKey: 'role_id' });
    }
  }
  Role.init({
    role_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role_name: { type: DataTypes.STRING, unique: true }
  }, {
    sequelize,
    modelName: 'Role',
    tableName: 'role',
    timestamps: false
  });
  return Role;
};
