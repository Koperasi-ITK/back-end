const {Keranjang,itemKeranjang,Barang,Transaksi,detailTransaksi,User,Saldo,metodePengiriman, statusPengiriman} = require("../../models");
const utils = require("../../../utils/utils");
  
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
        const hargaItem = item.Barang.harga;
        await Barang.update({ stok: item.Barang.stok - item.jumlah }, { where: { id: item.barangId } });
        
        await detailTransaksi.create({
          transaksiId: transaksi.id,
          barangId: item.barangId,
          jumlah: item.jumlah,
          hargaItem: hargaItem,
          totalHarga: item.jumlah * hargaItem,
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

      await detailTransaksi.destroy({
        where: { transaksiId: transaksi.id }
      });

      await transaksi.update({ statusPengirimanId: cancelledStatus.id });

      return res.status(200).json(utils.apiSuccess("Pembatalan checkout berhasil. Saldo dan stok barang telah dikembalikan."));
  } catch (error) {
      console.error(error);
      return res.status(500).json(utils.apiError("Kesalahan pada internal server.", { error: error.message }));
  }
};

  