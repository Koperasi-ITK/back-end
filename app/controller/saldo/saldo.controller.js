const { Saldo, User } = require("../../models");
const utils = require("../../../utils/utils");

exports.checkAllSaldo = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        const saldo = await Saldo.findOne({ where: { userId } });
        if (!saldo) {
            return res.status(404).json(utils.apiError("Saldo Tidak ditemukan."));
        }

        res.status(200).json(utils.apiSuccess("Semua saldo Berhasil Di temukan", {
            saldoIuranWajib: saldo.saldoIuranWajib,
            saldoIuranSukarela: saldo.saldoIuranSukarela,
            saldoPenjualan: saldo.saldoPenjualan
        }));
    } catch (error) {
        console.error("Gagal Mendapatkan Saldo:", error.message);
        res.status(500).json(utils.apiError("Internal server error", { error: error.message }));
    }
};

exports.transferSaldoPenjualanToSukarela = async (req, res) => {
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

