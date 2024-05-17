const {Keranjang,itemKeranjang,Barang,Transaksi,detailTransaksi,User,Saldo,metodePengiriman, statusPengiriman} = require("../../models");
const utils = require("../../../utils/utils");
const { Op } = require('sequelize');

exports.checkout = async (req, res) => {
  const userId = res.locals.user.id;
  const { metodePengirimanName, alamatPengiriman, waktuPengambilan } = req.body;

  try {
      const keranjang = await Keranjang.findOne({
          where: { userId },
          include: [{ model: itemKeranjang, include: [Barang] }]
      });

      if (!keranjang || keranjang.itemKeranjangs.length === 0) {
          return res.status(404).json(utils.apiError("Keranjang kosong atau tidak ditemukan."));
      }

      let StatusBarang = [];
      for (const item of keranjang.itemKeranjangs) {
          if (item.jumlah > item.Barang.stok) {
              StatusBarang.push({ namaBarang: item.Barang.nama, sisaStok: item.Barang.stok });
          }
      }

      if (StatusBarang.length > 0) {
          return res.status(400).json(utils.apiError("Stok tidak cukup untuk beberapa barang", { StatusBarang }));
      }

      const metodePengirimanEntry = await metodePengiriman.findOne({ where: { metodePengirimanName } });
      const statusPengirimanInitial = await statusPengiriman.findOne({ where: { statusPengirimanName: 'Menunggu Penjual' } });

      if (!metodePengirimanEntry || !statusPengirimanInitial) {
          return res.status(400).json(utils.apiError("Metode pengiriman atau status pengiriman tidak valid."));
      }

      let totalHarga = keranjang.itemKeranjangs.reduce((acc, item) => acc + (item.jumlah * item.Barang.harga), 0);
      
      const saldo = await Saldo.findOne({ where: { userId } });
      if (!saldo || saldo.saldoIuranSukarela < totalHarga) {
          return res.status(400).json(utils.apiError("Saldo tidak cukup."));
      }

      saldo.saldoIuranSukarela -= totalHarga;
      await saldo.save();

      let deliveryDetails = {};
      if (metodePengirimanEntry.metodePengirimanName === 'Diantar') {
          deliveryDetails.alamatPengiriman = alamatPengiriman;
      } else if (metodePengirimanEntry.metodePengirimanName === 'Ambil Sendiri') {
          deliveryDetails.waktuPengambilan = waktuPengambilan;
      }

      const transaksi = await Transaksi.create({
          userId,
          metodePengirimanId: metodePengirimanEntry.id,
          statusPengirimanId: statusPengirimanInitial.id,
          totalHarga,
          ...deliveryDetails,
          createdAt: new Date(),
          updatedAt: new Date()
      });

      for (const item of keranjang.itemKeranjangs) {
          await Barang.update({ stok: item.Barang.stok - item.jumlah }, { where: { id: item.barangId } });
          await detailTransaksi.create({
              transaksiId: transaksi.id,
              barangId: item.barangId,
              jumlah: item.jumlah,
              hargaItem: item.Barang.harga,
              totalHarga: item.jumlah * item.Barang.harga,
              createdAt: new Date(),
              updatedAt: new Date()
          });
      }
      await itemKeranjang.destroy({ where: { keranjangId: keranjang.id } });
      await Keranjang.destroy({ where: { id: keranjang.id } });

      return res.status(200).json(utils.apiSuccess("Checkout berhasil. Saldo telah diperbarui, dan detail transaksi tersimpan.", transaksi));
  } catch (error) {
      console.error(error);
      return res.status(500).json(utils.apiError("Kesalahan pada internal server.", { error: error.message }));
  }
};

exports.cancelCheckout = async (req, res) => {
  const userId = res.locals.user.id;
  const { transaksiId } = req.body;

  try {
      const transaksi = await Transaksi.findOne({
          where: { id: transaksiId, userId }
      });

      if (!transaksi) {
          return res.status(404).json(utils.apiError("Transaksi tidak ditemukan."));
      }
      const cancelledStatus = await statusPengiriman.findOne({ where: { statusPengirimanName: 'Transaksi Dibatalkan' } });
      if (!cancelledStatus) {
          return res.status(404).json(utils.apiError("Status pembatalan tidak ditemukan."));
      }

      const detailTransaksiRecords = await detailTransaksi.findAll({
          where: { transaksiId: transaksi.id }
      });

      let totalRefund = 0;
      for (const detail of detailTransaksiRecords) {
          totalRefund += detail.totalHarga;
          await Barang.increment('stok', { by: detail.jumlah, where: { id: detail.barangId } });
      }
      const saldo = await Saldo.findOne({ where: { userId } });
      if (!saldo) {
          return res.status(400).json(utils.apiError("Saldo tidak ditemukan."));
      }
      saldo.saldoIuranSukarela += totalRefund;
      await saldo.save();

      // kalau mau destroy di detail transaksi
      // await detailTransaksi.destroy({
      //   where: { transaksiId: transaksi.id }
      // });

      await transaksi.update({ statusPengirimanId: cancelledStatus.id });

      return res.status(200).json(utils.apiSuccess("Pembatalan checkout berhasil. Saldo dan stok barang telah dikembalikan."));
  } catch (error) {
      console.error(error);
      return res.status(500).json(utils.apiError("Kesalahan pada internal server.", { error: error.message }));
  }
};

exports.getTransaksi = async (req, res) => {
  const userId = res.locals.user.id;
  const { statusPengirimanId, transaksiId } = req.params;
  let statusCondition;
  if (statusPengirimanId) {
    statusCondition = { id: statusPengirimanId };
  } else {
    statusCondition = { 
      [Op.not]: { id: { [Op.in]: [8, 12] } }
    };
  }

  try {
    const transactions = await Transaksi.findAll({
      where: { userId, ...(transaksiId && { id: transaksiId }) },
      attributes: ['id', 'totalHarga', 'alamatPengiriman', 'waktuPengambilan','createdAt'],
      include: [
        {
          model: detailTransaksi,
          include: [{
            model: Barang,
            attributes: ['nama', 'harga', 'urlGambar']
          }],
          attributes: ['jumlah', 'hargaItem', 'totalHarga']
        },
        {
          model: statusPengiriman,
          attributes: ['statusPengirimanName'],
          where: statusCondition
        },
        {
          model: metodePengiriman,
          attributes: ['metodePengirimanName']
        }
      ]
    });

    if (!transactions.length) {
      return res.status(404).json({ message: "Tidak ada Transaksi" });
    }

    const mappedTransactions = transactions.map(transaction => ({
      transactionId: transaction.id,
      totalHarga: transaction.totalHarga,
      alamatPengiriman: transaction.alamatPengiriman,
      waktuPengambilan: transaction.waktuPengambilan,
      createdAt: transaction.createdAt,
      items: transaction.detailTransaksis.map(item => ({
        name: item.Barang.nama,
        price: item.Barang.harga,
        ImageUrl: item.Barang.urlGambar,
        jumlah: item.jumlah,
        HargaItem: item.hargaItem,
        totalHargaItem: item.totalHarga
      })),
      StatusPengiriman: transaction.statusPengiriman.statusPengirimanName,
      MetodePengiriman: transaction.metodePengiriman.metodePengirimanName
    }));

    return res.status(200).json({ status: 'success', message: "Transaksi Ditemukan.", data: mappedTransactions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: "An error occurred while retrieving transactions.", errors: { error: error.message } });
  }
};

exports.getSalesHistory = async (req, res) => {
  const sellerId = res.locals.user.id;

  try {
    const sales = await detailTransaksi.findAll({
      include: [
        {
          model: Transaksi,
          attributes: ['id', 'totalHarga', 'statusPengirimanId', 'createdAt', 'updatedAt'],
          include: [{
            model: statusPengiriman,
            attributes: ['statusPengirimanName']
          }]
        },
        {
          model: Barang,
          where: { userId: sellerId },
          attributes: ['nama', 'harga', 'urlGambar']
        }
      ]
    });

    if (!sales.length) {
      return res.status(404).json({ message: "Tidak ada riwayat penjualan." });
    }

    const salesHistory = sales.map(sale => ({
      transactionId: sale.Transaksi.id,
      totalHarga: sale.Transaksi.totalHarga,
      statusPengiriman: sale.Transaksi.statusPengiriman.statusPengirimanName,
      createdAt: sale.Transaksi.createdAt,
      updatedAt: sale.Transaksi.updatedAt,
      item: {
        name: sale.Barang.nama,
        price: sale.Barang.harga,
        ImageUrl: sale.Barang.urlGambar,
        jumlah: sale.jumlah,
        hargaItem: sale.hargaItem,
        totalHargaItem: sale.totalHarga
      }
    }));

    return res.status(200).json({ status: 'success', message: "Riwayat Penjualan ditemukan.", data: salesHistory });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: "Kesalahan server saat mengambil riwayat penjualan.", error: error.message });
  }
};

async function distributeFunds(transaksiId) {
  const detailTransaksis = await detailTransaksi.findAll({
      where: { transaksiId },
      include: [{ model: Barang }]
  });
  for (const detail of detailTransaksis) {
      const barang = await Barang.findOne({
          where: { id: detail.barangId }
      });
      const sellerId = barang.userId;
      const hargaItem = detail.totalHarga;
      const saldo = await Saldo.findOne({
          where: { userId: sellerId }
      });
      if (saldo) {
          saldo.saldoPenjualan += hargaItem;
          await saldo.save();
      }
  }
}

exports.BarangDiterima = async (req, res) => {
  const { transaksiId } = req.params;
  const userId = res.locals.user.id;

  try {
      const transaksi = await Transaksi.findOne({
          where: { id: transaksiId, userId, statusPengirimanId: { [Op.not]: 8 } }
      });

      if (!transaksi) {
          return res.status(404).json({ message: "Transaksi tidak ditemukan atau sudah dikonfirmasi." });
      }
      transaksi.statusPengirimanId = 8;
      await transaksi.save();

      await distributeFunds(transaksiId);

      return res.status(200).json({ message: "Konfirmasi penerimaan berhasil." });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Kesalahan server saat mengkonfirmasi penerimaan.", error: error.message });
  }
};


