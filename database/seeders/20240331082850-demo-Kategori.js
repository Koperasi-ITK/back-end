"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Kategoris",
      [
        {
          namaKategori: "Makanan Berat",
          image: "https://ik.imagekit.io/xoh0kfeiy/pngtree-illustration-of-burger-and-soft-drink-takeout-vector-design-food-logo-png-image_7963593_tgcOFE72w.png",
          potonganHarga: 1000,
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
