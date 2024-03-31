'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StatusStok extends Model {
    static associate(models) {
<<<<<<< HEAD
      StatusStok.belongsToMany(models.Barang, { through: 'BarangStatusStok', foreignKey: 'status_stok_id' });
=======
      statusStok.hasMany(models.Barang, {
        foreignKey: "statusStokId",
      });
>>>>>>> 4f3ddd2cef7fa767eee0635fdefba02e375de626
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
