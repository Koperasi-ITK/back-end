"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('statusStoks', [
      {
        statusStok: 'Tersedia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusStok: 'Tidak Tersedia',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('statusStoks', null, {});
  }
};
