"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("statusAnggota", [
      {
        statusName: "Aktif",
      },
      {
        statusName: "Tidak Aktif",
      },
      {
        statusName: "Bukan Member",
      },
      {
        statusName: "Dihapus",
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
