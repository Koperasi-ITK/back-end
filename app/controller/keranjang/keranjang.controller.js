const { Keranjang, itemKeranjang, Barang, User } = require("../../models");
const utils = require("../../../utils/utils");

exports.tambahKeKeranjang = async (req, res) => {
    const userId = res.locals.user.id;
    const { barangId, jumlah } = req.body;

    try {
        const barang = await Barang.findByPk(barangId);
        if (!barang) {
            return res.status(404).json(utils.apiError("Barang tidak ditemukan"));
        }

        if (barang.stok < jumlah) {
            return res.status(400).json(utils.apiError("Stok barang tidak mencukupi"));
        }
        let keranjang = await Keranjang.findOne({ where: { userId } });
        if (!keranjang) {
            keranjang = await Keranjang.create({ userId });
        }
        const item = await itemKeranjang.create({
            keranjangId: keranjang.id,
            barangId,
            jumlah
        });

        return res.status(201).json(utils.apiSuccess("Barang berhasil ditambahkan ke keranjang", item));
    } catch (error) {
        console.log(error);
        return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};