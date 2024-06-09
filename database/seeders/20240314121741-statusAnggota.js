"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusAnggota", [
      {
        statusName: "Aktif",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusName: "Tidak Aktif",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusName: "Bukan Member",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusName: "Dihapus",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("statusAnggota", null, {});
  },
};
