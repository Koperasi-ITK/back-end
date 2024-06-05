const { where } = require("sequelize");
const utils = require("../../../utils/utils"),
  { Saldo, User, RiwayatTopup,Pendapatan, Biaya,Transaksi,metodePengiriman,statusPengiriman,detailTransaksi, Barang } = require("../../models");

  const addSaldo = async (req, res) => {
    try {
      const { email } = req.params;
      const { saldoIuranWajib, saldoIuranSukarela } = req.body;
  
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
  
      if (!user) return res.status(404).json(utils.apiError("User tidak ditemukan"));
  
      const saldo = await Saldo.findOne({
        where: {
          userId: user.id,
        },
      });
  
      const biaya = await Biaya.findOne({
        where: {
          id: 1,
        },
      });
  
      if (!biaya) return res.status(404).json(utils.apiError("Biaya tidak ditemukan"));
  
      const { BiayaIuranBulanan } = biaya;
  
      // Calculate the number of months to add for saldoIuranWajib
      let monthsToAdd = 0;
      if (saldoIuranWajib) {
        monthsToAdd = Math.floor(saldoIuranWajib / BiayaIuranBulanan);
      }
  
      // Update the user's AktifSampai date
      if (monthsToAdd > 0) {
        const currentDate = new Date(user.AktifSampai || new Date());
        currentDate.setMonth(currentDate.getMonth() + monthsToAdd);
        await User.update(
          {
            AktifSampai: currentDate,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
      }
  
      // Update the Saldo with the provided values
      const updatedSaldo = {};
      if (saldoIuranWajib) {
        updatedSaldo.saldoIuranWajib = saldo.saldoIuranWajib + saldoIuranWajib;
      }
      if (saldoIuranSukarela) {
        updatedSaldo.saldoIuranSukarela = saldo.saldoIuranSukarela + saldoIuranSukarela;
      }
  
      await Saldo.update(updatedSaldo, {
        where: {
          userId: saldo.userId,
        },
      });
  
      await RiwayatTopup.create({
        userId: user.id,
        saldoIuranWajib: saldoIuranWajib || 0,
        saldoIuranSukarela: saldoIuranSukarela || 0,
      });
  
      const data = {
        email: user.email,
        saldoIuranWajib: saldoIuranWajib || 0,
        saldoIuranSukarela: saldoIuranSukarela || 0,
        AktifSampai: user.AktifSampai,
      };
  
      return res.status(200).json(utils.apiSuccess(`Berhasil menambah saldo ${user.name}`, data));
    } catch (error) {
      console.log(error);
      return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
    }
  };
  

const RiwayatTopUp = async (req, res) => {
  try {
    const RiwayatSaldo = await RiwayatTopup.findAll({
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
    });

    const result = RiwayatSaldo.map((item) => {
      return {
        id: item.id,
        userId: item.userId,
        name: item.User.name,
        email: item.User.email,
        saldoIuranWajib: item.saldoIuranWajib,
        saldoIuranSukarela: item.saldoIuranSukarela,
        createdAt: item.createdAt,
      };
    });

    return res
      .status(200)
      .json(utils.apiSuccess("Berhasil mengambil riwayat topup", result));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const saldoUser = async (req, res) => {
  try {
    const userId = res.locals.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json(utils.apiError("User Tidak Ditemukan"));

    const data = await Saldo.findOne({
      where: {
        userId: user.id,
      },
    });

    return res.status(200).json(utils.apiSuccess("Berhasil mengambil saldo", data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const transferSaldoPenjualanToSukarela = async (req, res) => {
  try {
      const userId = res.locals.user.id;
      const { amount } = req.body;

      const saldo = await Saldo.findOne({ where: { userId } });
      if (!saldo) {
          return res.status(404).json(utils.apiError("Saldo Tidak ditemukan."));
      }

      if (amount > saldo.saldoPenjualan) {
          return res.status(409).json(utils.apiError("Saldo Anda tidak cukup."));
      }

      saldo.saldoIuranSukarela += amount;
      saldo.saldoPenjualan -= amount;
      await saldo.save();

      res.status(200).json(utils.apiSuccess("Saldo transferred successfully", saldo));
  } catch (error) {
      console.error("Failed to transfer saldo:", error.message);
      res.status(500).json(utils.apiError("Internal server error", { error: error.message }));
  }
};

const getPendapatan = async (req, res) => {
  try {
    const { status } = req.query;

    let statusCondition = {};
    if (status === 'canceled') {
      statusCondition = { statusPengirimanId: [12] };
    } else if (status === 'ongoing') {
      statusCondition = { statusPengirimanId: [3, 4, 5, 6, 7] };
    } else if (status === 'successful') {
      statusCondition = { statusPengirimanId: 8 };
    }

    const allTransaksi = await Transaksi.findAll({
      where: statusCondition,
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
        {
          model: metodePengiriman,
          attributes: ["metodePengirimanName"],
        },
        {
          model: statusPengiriman,
          attributes: ["statusPengirimanName"],
        },
        {
          model: detailTransaksi,
          attributes: ["jumlah", "hargaItem", "totalHarga"],
          include: [
            {
              model: Barang,
              attributes: ["nama", "harga"],
            },
          ],
        },
      ],
    });

    const pendapatan = await Pendapatan.findAll();

    const totalCategoryRevenue = pendapatan.reduce((total, item) => total + item.categoryRevenue, 0);
    const totalShippingRevenue = pendapatan.reduce((total, item) => total + item.shippingRevenue, 0);

    const itemDetails = {};
    let totalSalesRevenue = 0;

    allTransaksi.forEach(transaksi => {
      transaksi.detailTransaksis.forEach(detail => {
        if (detail.Barang) {
          if (!itemDetails[detail.Barang.nama]) {
            itemDetails[detail.Barang.nama] = {
              barangId: detail.barangId,
              nama: detail.Barang.nama,
              jumlah: 0,
              totalHarga: 0,
            };
          }
          itemDetails[detail.Barang.nama].jumlah += detail.jumlah;
          itemDetails[detail.Barang.nama].totalHarga += detail.totalHarga;
          totalSalesRevenue += detail.totalHarga;
        }
      });
    });

    const aggregatedItemsSold = Object.values(itemDetails);

    const result = {
      totalTransaksi: allTransaksi.length,
      totalCategoryRevenue,
      totalShippingRevenue,
      totalSalesRevenue,
      itemsSold: aggregatedItemsSold,
    };

    return res.status(200).json(utils.apiSuccess("Berhasil mengambil pendapatan", result));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

const editBiaya = async (req, res) => {
  try {
    const { id } = req.params;
    const { BiayaAntar, BiayaIuranBulanan } = req.body;
    console.log("ini biaya :",BiayaAntar," ini iuran:",BiayaIuranBulanan)
    const biaya = await Biaya.findByPk(id);
    if (!biaya) return res.status(404).json(utils.apiError("Biaya tidak ditemukan"));

    biaya.BiayaAntar = BiayaAntar !== undefined ? BiayaAntar : biaya.BiayaAntar;
    biaya.BiayaIuranBulanan = BiayaIuranBulanan !== undefined ? BiayaIuranBulanan : biaya.BiayaIuranBulanan;

    await biaya.save();

    return res.status(200).json(utils.apiSuccess("Biaya berhasil diupdate", biaya));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};
const getBiaya = async (req, res) => {
  try {
    const biaya = await Biaya.findAll();

    return res.status(200).json(utils.apiSuccess("Berhasil mengambil biaya", biaya));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

module.exports = {
  addSaldo,
  RiwayatTopUp,
  saldoUser,
  transferSaldoPenjualanToSukarela,
  getPendapatan,
  editBiaya,
  getBiaya
};