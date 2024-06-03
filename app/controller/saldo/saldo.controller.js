const { where } = require("sequelize");
const utils = require("../../../utils/utils"),
  { Saldo, User, RiwayatTopup,Pendapatan, Biaya } = require("../../models");

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

    await Saldo.update(
      {
        saldoIuranWajib: (saldo.saldoIuranWajib += saldoIuranWajib),
        saldoIuranSukarela: (saldo.saldoIuranSukarela += saldoIuranSukarela),
      },
      {
        where: {
          userId: saldo.id,
        },
      }
    );

    await RiwayatTopup.create({
      userId: user.id,
      saldoIuranWajib: saldoIuranWajib,
      saldoIuranSukarela: saldoIuranSukarela,
    });

    const data = {
      email: user.email,
      saldoIuranWajib: saldoIuranWajib,
      saldoIuranSukarela: saldoIuranSukarela,
    };

    return res
      .status(400)
      .json(utils.apiSuccess(`Berhasil menambah saldo ${user.name}`, data));
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
    const pendapatan = await Pendapatan.findAll();

    const totalCategoryRevenue = pendapatan.reduce((total, item) => total + item.categoryRevenue, 0);
    const totalShippingRevenue = pendapatan.reduce((total, item) => total + item.shippingRevenue, 0);

    const result = {
      totalCategoryRevenue,
      totalShippingRevenue
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