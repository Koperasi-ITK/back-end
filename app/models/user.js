"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: "roleId",
      });
      User.hasOne(models.Saldo, {
        foreignKey: "userId",
      });
      User.belongsTo(models.statusAnggota, {
        foreignKey: "statusAnggotaId",
      });
      User.hasMany(models.Transaksi, {
        foreignKey: "userId",
      });
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      roleId: {
        type: DataTypes.INTEGER,
      },
      statusAnggotaId: {
        type: DataTypes.INTEGER,
      },
      noTelp: DataTypes.STRING,
      urlProfile: {
        type: DataTypes.STRING,
        defaultValue:
          "https://www.iprcenter.gov/image-repository/blank-profile-picture.png/@@images/image.png",
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
