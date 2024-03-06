'use strict';
module.exports = (sequelize, DataTypes) => {
  const User_Role = sequelize.define('User_Role', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Role',
        key: 'id'
      }
    }
  }, {
    tableName: 'user_role',
    timestamps: false
  });
  return User_Role;
};