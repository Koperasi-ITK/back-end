const db = require('../models/index');

exports.tambahBarang = async (req, res) => {
    try {
        const { nama, harga, stok, kategori_id } = req.body;
        const user_id = req.user.userId;

        const barangBaru = await db.Barang.create({
            nama, 
            harga, 
            stok, 
            kategori_id, 
            user_id
        });

        if (req.file) {
            const gambarBaru = await db.GambarBarang.create({
                barang_id: barangBaru.barang_id,
                url_gambar: req.file.path
            });
        }

        res.status(201).json({ barangBaru, gambar: req.file ? req.file.path : null });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
