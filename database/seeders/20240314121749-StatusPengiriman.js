"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('statusPengirimans', [
      {
        statusPengirimanName: 'Stok Kosong',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Stok Tersedia',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Menunggu Penjual',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Diproses Penjual',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Menunggu Kurir',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Sedang Dikirim',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Sampai di Tujuan',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Diterima Pembeli',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Menunggu Diambil',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Dikirim Balik',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Transaksi Gagal',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        statusPengirimanName: 'Transaksi Dibatalkan',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('statusPengirimans', null, {});
  }
};
