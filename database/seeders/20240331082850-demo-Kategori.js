"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Kategoris",
      [
        {
          namaKategori: "Elektronik",
          image: "elektronik.jpg",
          potonganHarga: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          namaKategori: "Pakaian",
          image: "pakaian.jpg",
          potonganHarga: 15,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          namaKategori: "Makanan",
          image: "makanan.jpg",
          potonganHarga: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Kategoris", null, {});
  },
};
