'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserStatus = sequelize.define('UserStatus', {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'StatusKeanggotaan',
        key: 'id'
      }
    }
  }, {
    tableName: 'userstatus',
    timestamps: false
  });
  return UserStatus;
};