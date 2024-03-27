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

        let keranjang = await Keranjang.findOne({ where: { userId } });
        if (!keranjang) {
            keranjang = await Keranjang.create({ userId });
        }

        let item = await itemKeranjang.findOne({
            where: { 
                keranjangId: keranjang.id, 
                barangId 
            }
        });

        const totalJumlah = item ? item.jumlah + jumlah : jumlah;
        if (barang.stok < totalJumlah) {
            return res.status(400).json(utils.apiError("Tidak dapat menambahkan barang ke keranjang. Jumlah yang diminta melebihi stok yang tersedia."));
        }
        if (item) {
            item.jumlah = totalJumlah;
            await item.save();
            return res.status(200).json(utils.apiSuccess("Jumlah barang di keranjang berhasil diperbarui", item));
        } else {
            item = await itemKeranjang.create({
                keranjangId: keranjang.id,
                barangId,
                jumlah
            });
            return res.status(201).json(utils.apiSuccess("Barang berhasil ditambahkan ke keranjang", item));
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};

exports.getBarangDiKeranjang = async (req, res) => {
    const userId = res.locals.user.id;

    try {
        const keranjang = await Keranjang.findOne({ where: { userId } });
        if (!keranjang) {
            return res.status(404).json(utils.apiError("Keranjang tidak ditemukan"));
        }
        const items = await itemKeranjang.findAll({
            where: { keranjangId: keranjang.id },
            include: [
                {
                    model: Barang,
                    as: 'Barang',
                }
            ]
        });
        if (items.length === 0) {
            return res.status(200).json(utils.apiSuccess("Keranjang kosong", []));
        }
        return res.status(200).json(utils.apiSuccess("Item di keranjang", items));
    } catch (error) {
        console.log(error);
        return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};