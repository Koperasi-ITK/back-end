const {Pendapatan,Keranjang,itemKeranjang,Barang,Transaksi,detailTransaksi,User,Saldo,metodePengiriman, statusPengiriman,Kategori,Biaya} = require("../../models");
const utils = require("../../../utils/utils");
const { Op } = require('sequelize');
const barang = require("../../models/barang");
const { logAction,getCurrentTime } = require('../../../utils/Logging');

exports.checkout = async (req, res) => {
  const userId = res.locals.user.id;
  const { metodePengirimanName, alamatPengiriman, waktuPengambilan } = req.body;

  try {
      const keranjang = await Keranjang.findOne({
          where: { userId },
          include: [{ 
            model: itemKeranjang, 
            include: [{ 
              model: Barang,
              include: [{ model: Kategori }] 
            }] 
          }]
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

      let totalHarga = keranjang.itemKeranjangs.reduce((acc, item) => {
        const potonganHarga = item.Barang.Kategori.potonganHarga || 0;
        const hargaFinal = item.Barang.harga + potonganHarga;
        return acc + (item.jumlah * hargaFinal);
      }, 0);

      const biayaEntry = await Biaya.findOne();
      if (!biayaEntry) {
          return res.status(500).json(utils.apiError("Biaya pengantaran tidak ditemukan."));
      }

      if (metodePengirimanEntry.metodePengirimanName === 'Diantar') {
          totalHarga += biayaEntry.BiayaAntar;

      }

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
          const potonganHarga = item.Barang.Kategori.potonganHarga || 0;
          const hargaFinal = item.Barang.harga + potonganHarga;
          await Barang.update({ stok: item.Barang.stok - item.jumlah }, { where: { id: item.barangId } });
          await detailTransaksi.create({
              transaksiId: transaksi.id,
              barangId: item.barangId,
              jumlah: item.jumlah,
              hargaItem: hargaFinal,
              totalHarga: item.jumlah * hargaFinal,
              createdAt: new Date(),
              updatedAt: new Date()
          });
      }
      await itemKeranjang.destroy({ where: { keranjangId: keranjang.id } });
      await Keranjang.destroy({ where: { id: keranjang.id } });
      await logAction(userId, 'CheckOut Pemesanan', new Date(), getCurrentTime());
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

      const metodePengirimanEntry = await metodePengiriman.findOne({ where: { id: transaksi.metodePengirimanId } });
      const biayaEntry = await Biaya.findOne();
      if (metodePengirimanEntry && metodePengirimanEntry.metodePengirimanName === 'Diantar' && biayaEntry) {
          totalRefund += biayaEntry.BiayaAntar;
      }

      const saldo = await Saldo.findOne({ where: { userId } });
      if (!saldo) {
          return res.status(400).json(utils.apiError("Saldo tidak ditemukan."));
      }
      saldo.saldoIuranSukarela += totalRefund;
      await saldo.save();

      // Uncomment the following lines if you want to delete the detail transaksi records
      // await detailTransaksi.destroy({
      //   where: { transaksiId: transaksi.id }
      // });

      await transaksi.update({ statusPengirimanId: cancelledStatus.id });
      await logAction(userId, 'Cancel Pemesanan', new Date(), getCurrentTime());
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
            attributes: ['nama', 'harga', 'urlGambar'],
            include: [{ model: Kategori, attributes: ['potonganHarga'] }]
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
      items: transaction.detailTransaksis.map(item => {
        const potonganHarga = item.Barang.Kategori.potonganHarga || 0;
        const hargaFinal = item.Barang.harga + potonganHarga;
        return {
          name: item.Barang.nama,
          price: hargaFinal,
          ImageUrl: item.Barang.urlGambar,
          jumlah: item.jumlah,
          HargaItem: hargaFinal,
          totalHargaItem: item.jumlah * hargaFinal
        }
      }),
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
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const offset = (page - 1) * limit;

    const { count, rows } = await detailTransaksi.findAndCountAll({
      offset,
      limit,
      order: [['Transaksi', 'createdAt', 'DESC']],
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
          attributes: ['nama', 'harga', 'urlGambar'],
          include: [{ model: Kategori, attributes: ['potonganHarga'] }]
        }
      ]
    });

    if (!rows.length) {
      return res.status(404).json({ message: "Tidak ada riwayat penjualan." });
    }

    const salesHistory = rows.map(sale => {
      return {
        transactionId: sale.Transaksi.id,
        totalHarga: sale.jumlah * sale.Barang.harga,
        statusPengiriman: sale.Transaksi.statusPengiriman.statusPengirimanName,
        createdAt: sale.Transaksi.createdAt,
        updatedAt: sale.Transaksi.updatedAt,
        item: {
          name: sale.Barang.nama,
          price: sale.Barang.harga,
          ImageUrl: sale.Barang.urlGambar,
          jumlah: sale.jumlah,
          hargaItem: sale.Barang.harga,
          totalHargaItem: sale.jumlah * sale.Barang.harga
        }
      };
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 'success',
      message: "Riwayat Penjualan ditemukan.",
      data: salesHistory,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: count
      }
    });
  } catch (error) {
    console.error('Error fetching sales history:', error);
    return res.status(500).json({ status: 'error', message: "Kesalahan server saat mengambil riwayat penjualan.", error: error.message });
  }
};

async function distributeFunds(transaksiId) {
  const detailTransaksis = await detailTransaksi.findAll({
    where: { transaksiId },
    include: [{ model: Barang, include: [{ model: Kategori }] }]
  });

  for (const detail of detailTransaksis) {
    const barang = detail.Barang;
    const sellerId = barang.userId;
    const originalHarga = barang.harga;
    const potonganHarga = barang.Kategori.potonganHarga || 0;
    const hargaItem = originalHarga * detail.jumlah;
    const pendapatanPlatform = potonganHarga * detail.jumlah;

    const saldo = await Saldo.findOne({
      where: { userId: sellerId }
    });

    if (saldo) {
      saldo.saldoPenjualan += hargaItem;
      await saldo.save();
    }

    await Pendapatan.create({
      transaksiId,
      shippingRevenue: 0,
      categoryRevenue: pendapatanPlatform,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  const transaksi = await Transaksi.findOne({ where: { id: transaksiId } });
  const metodePengirimanEntry = await metodePengiriman.findOne({ where: { id: transaksi.metodePengirimanId } });
  const biayaEntry = await Biaya.findOne();
  
  if (metodePengirimanEntry && metodePengirimanEntry.metodePengirimanName === 'Diantar' && biayaEntry) {
    const pendapatan = await Pendapatan.findOne({ where: { transaksiId } });
    pendapatan.shippingRevenue = biayaEntry.BiayaAntar;
    await pendapatan.save();
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
    await logAction(userId, 'Konfirmasi Barang Telah Diterima', new Date(), getCurrentTime());
    return res.status(200).json({ message: "Konfirmasi penerimaan berhasil." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Kesalahan server saat mengkonfirmasi penerimaan.", error: error.message });
  }
};

exports.getAllTransaksi = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status || 'all';
  const statuses = req.query.statuses ? req.query.statuses.split(',').map(Number) : [];

  try {
    const offset = (page - 1) * limit;

    let statusCondition = {};
    if (status === 'canceled') {
      statusCondition = { statusPengirimanId: [11, 12] };
    } else if (status === 'ongoing') {
      if (statuses.length) {
        statusCondition = { statusPengirimanId: statuses };
      } else {
        statusCondition = { statusPengirimanId: [3, 4, 5, 6, 7 ,9] };
      }
    } else if (status === 'successful') {
      statusCondition = { statusPengirimanId: 8 };
    }

    const { count, rows } = await Transaksi.findAndCountAll({
      offset,
      limit,
      where: statusCondition,
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'totalHarga', 'alamatPengiriman', 'waktuPengambilan', 'createdAt', 'updatedAt'],
      include: [
        {
          model: detailTransaksi,
          attributes: ['jumlah', 'hargaItem', 'totalHarga'],
          include: [
            {
              model: Barang,
              attributes: ['nama', 'harga', 'urlGambar', 'userId'],
              include: [
                {
                  model: Kategori,
                  attributes: ['potonganHarga'],
                  required: false
                }
              ],
              required: false
            }
          ],
          required: false
        },
        {
          model: statusPengiriman,
          attributes: ['statusPengirimanName'],
          required: false
        },
        {
          model: metodePengiriman,
          attributes: ['metodePengirimanName'],
          required: false
        },
        {
          model: User,
          attributes: ['name'],
          required: false
        }
      ]
    });

    if (!rows.length) {
      return res.status(404).json({ message: "Tidak ada transaksi." });
    }

    // Fetch seller names
    const sellerIds = rows.flatMap(transaction => 
      transaction.detailTransaksis.map(item => item.Barang?.userId).filter(Boolean)
    );
    const uniqueSellerIds = [...new Set(sellerIds)];
    const sellers = await User.findAll({
      where: { id: uniqueSellerIds },
      attributes: ['id', 'name']
    });
    const sellerMap = Object.fromEntries(sellers.map(seller => [seller.id, seller.name]));

    const transactions = rows.map(transaction => ({
      transactionId: transaction.id,
      totalHarga: transaction.totalHarga,
      alamatPengiriman: transaction.alamatPengiriman,
      waktuPengambilan: transaction.waktuPengambilan,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      buyer: transaction.User?.name || "Unknown Buyer",
      items: transaction.detailTransaksis.map(item => {
        const potonganHarga = item.Barang?.Kategori?.potonganHarga || 0;
        const hargaFinal = item.Barang?.harga + potonganHarga;
        return {
          name: item.Barang?.nama || "Unknown Item",
          price: hargaFinal,
          imageUrl: item.Barang?.urlGambar || "",
          jumlah: item.jumlah,
          hargaItem: hargaFinal,
          totalHargaItem: item.jumlah * hargaFinal,
          seller: sellerMap[item.Barang?.userId] || "Unknown Seller"
        };
      }),
      statusPengiriman: transaction.statusPengiriman?.statusPengirimanName || "Unknown Status",
      metodePengiriman: transaction.metodePengiriman?.metodePengirimanName || "Unknown Method"
    }));

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json({
      status: 'success',
      message: "Transaksi ditemukan.",
      data: transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: count
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ status: 'error', message: "Kesalahan server saat mengambil transaksi.", error: error.message });
  }
};

//cancel co by pegawai
exports.cancelCheckoutByEmployee = async (req, res) => {
  const { transaksiId } = req.body;
  const userId = res.locals.user.id;
  try {
      const transaksi = await Transaksi.findOne({
          where: { id: transaksiId }
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

      const metodePengirimanEntry = await metodePengiriman.findOne({ where: { id: transaksi.metodePengirimanId } });
      const biayaEntry = await Biaya.findOne();
      if (metodePengirimanEntry && metodePengirimanEntry.metodePengirimanName === 'Diantar' && biayaEntry) {
          totalRefund += biayaEntry.BiayaAntar;
      }

      const saldo = await Saldo.findOne({ where: { userId: transaksi.userId } });
      if (!saldo) {
          return res.status(400).json(utils.apiError("Saldo tidak ditemukan."));
      }
      saldo.saldoIuranSukarela += totalRefund;
      await saldo.save();

      await transaksi.update({ statusPengirimanId: cancelledStatus.id });
      await logAction(userId, 'Membatalkan Pemesanan', new Date(), getCurrentTime());
      return res.status(200).json(utils.apiSuccess("Pembatalan checkout berhasil oleh pegawai. Saldo dan stok barang telah dikembalikan."));
  } catch (error) {
      console.error(error);
      return res.status(500).json(utils.apiError("Kesalahan pada internal server.", { error: error.message }));
  }
};

exports.updateStatusPengiriman = async (req, res) => {
  const { transaksiId, newStatus, newAlamatPengiriman } = req.body;
  const userId = res.locals.user.id;

  try {
    if (!transaksiId || (!newStatus && !newAlamatPengiriman)) {
      return res.status(400).json(utils.apiError("Transaksi ID dan status baru atau alamat pengiriman baru harus disertakan."));
    }

    const transaksi = await Transaksi.findOne({ where: { id: transaksiId } });

    if (!transaksi) {
      return res.status(404).json(utils.apiError("Transaksi tidak ditemukan."));
    }

    const metode = await metodePengiriman.findOne({ where: { id: transaksi.metodePengirimanId } });

    if (!metode) {
      return res.status(404).json(utils.apiError("Metode pengiriman tidak ditemukan."));
    }

    if (metode.metodePengirimanName === 'Ambil Sendiri') {
      if (!newAlamatPengiriman) {
        return res.status(400).json(utils.apiError("Alamat pengiriman baru harus disertakan untuk metode 'Ambil Sendiri'."));
      }
      transaksi.alamatPengiriman = newAlamatPengiriman;
      transaksi.statusPengirimanId = 9; //auto update status ke 9
    } else {
      if (!newStatus) {
        return res.status(400).json(utils.apiError("Status baru harus disertakan untuk metode selain 'Ambil Sendiri'."));
      }
      const status = await statusPengiriman.findOne({ where: { statusPengirimanName: newStatus } });

      if (!status) {
        return res.status(404).json(utils.apiError("Status pengiriman tidak ditemukan."));
      }

      transaksi.statusPengirimanId = status.id;
    }

    await transaksi.save();
    await logAction(userId, 'update status pengiriman pesanan', new Date(), getCurrentTime());
    return res.status(200).json(utils.apiSuccess("Status pengiriman berhasil diperbarui.", transaksi));
  } catch (error) {
    console.error(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server.", { error: error.message }));
  }
};