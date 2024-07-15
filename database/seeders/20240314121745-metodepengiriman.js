"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('metodePengirimans', [
      {
        metodePengirimanName: 'Diantar',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        metodePengirimanName: 'Ambil Sendiri',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('metodePengirimans', null, {});
  }
};
