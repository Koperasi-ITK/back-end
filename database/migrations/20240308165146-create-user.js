"use strict";

const { sequelize } = require('../../app/models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      statusAnggotaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      noTelp: {
        type: Sequelize.STRING,
      },
      urlProfile: {
        type: Sequelize.STRING,
      },
      AktifSampai: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  await queryInterface.sequelize.query(`
    CREATE TRIGGER update_status_anggota
    BEFORE UPDATE ON Users
    FOR EACH ROW
    BEGIN
      DECLARE activeStatusId INT;
      DECLARE inactiveStatusId INT;

      SET activeStatusId = (SELECT id FROM statusAnggota WHERE statusName = 'Sudah Bayar');
      SET inactiveStatusId = (SELECT id FROM statusAnggota WHERE statusName = 'Belum Bayar');

      IF NEW.AktifSampai IS NOT NULL THEN
        IF NEW.AktifSampai < NOW() THEN
          SET NEW.statusAnggotaId = inactiveStatusId;
        ELSE
          SET NEW.statusAnggotaId = activeStatusId;
        END IF;
      END IF;
    END
  `);
},

async down(queryInterface, Sequelize) {
  await queryInterface.sequelize.query(`
    DROP TRIGGER IF EXISTS update_status_anggota;
  `);
    await queryInterface.dropTable("Users");
  },
};
