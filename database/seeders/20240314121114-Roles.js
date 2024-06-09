"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Roles", [
      {
        roleName: "Pengguna",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: "Penitip",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: "Pegawai",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        roleName: "Admin",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Roles", null, {});
  },
};
