const utils = require("../../../utils/utils"),
  { Saldo, User } = require("../../models");
const { apiError, apiSuccess } = require("../../../utils/utils");

const addSaldo = async (req, res) => {
  try {
    const { email } = req.params;
    const { saldoIuranWajib, saldoIuranSukarela, saldoPenjualan } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (!user) return res.status(404).json(apiError("User tidak ditemukan"));

    const saldo = await Saldo.findOne({
      where: {
        userId: user.id,
      },
    });

    await Saldo.update(
      {
        saldoIuranWajib: (saldo.saldoIuranWajib += saldoIuranWajib),
        saldoIuranSukarela: (saldo.saldoIuranSukarela += saldoIuranSukarela),
        saldoPenjualan: (saldo.saldoPenjualan += saldoPenjualan),
      },
      {
        where: {
          userId: saldo.id,
        },
      }
    );

    const data = {
      saldoIuranWajib: saldoIuranWajib,
      saldoIuranSukarela: saldoIuranSukarela,
      saldoPenjualan: saldoPenjualan,
    };

    return res
      .status(400)
      .json(utils.apiSuccess(`Berhasil menambah saldo ${user.name}`, data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server error"));
  }
};

module.exports = {
  addSaldo,
};
