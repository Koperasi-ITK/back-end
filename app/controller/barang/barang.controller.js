const utils = require("../../../utils/utils");
const ImageKitFile = require("../../../utils/ImageKit");
const { Barang, Kategori, statusStok, User } = require("../../models");

exports.tambahBarang = async (req, res) => {
    try {
        const { nama, harga, stok, kategoriId, statusStokId } = req.body;
        const userId = res.locals.user.id;
        const image = req.file;

        if (typeof image === "undefined")
            return res.status(422).json(utils.apiError("Gambar tidak boleh kosong"));

        const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
        const allowedSizeMb = 2;

        if (!allowedMimes.includes(image.mimetype))
            return res.status(409).json(utils.apiError("Format gambar tidak diperbolehkan"));

        if (image.size / (1024 * 1024) > allowedSizeMb)
            return res.status(409).json(utils.apiError("Gambar tidak boleh lebih dari 2mb"));

        const uploadFile = await ImageKitFile.upload(image);

        if (!uploadFile) return res.status(409).json(utils.apiError("Gagal mengupload gambar"));

        const barangBaru = await Barang.create({
            nama,
            harga,
            stok,
            kategoriId,
            userId,
            statusStokId,
            urlGambar: uploadFile.url
        });

        res.status(201).json(utils.apiSuccess("Barang berhasil ditambahkan", barangBaru));
    } catch (error) {
        console.log(error);
        res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};

exports.hapusBarang = async (req, res) => {
    try {
      const barangId = req.params.id;
      const userId = res.locals.user.id;
      const barang = await Barang.findByPk(barangId);
  
      if (!barang) {
        return res.status(404).json(utils.apiError("Barang tidak ditemukan"));
      }
      if (barang.userId !== userId) {
        return res.status(403).json(utils.apiError("Hanya pemilik barang yang dapat menghapus barang ini"));
      }
      await Barang.destroy({
        where: {
          id: barangId
        }
      });
  
      res.status(200).json(utils.apiSuccess("Barang berhasil dihapus"));
    } catch (error) {
      console.log(error);
      res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
  };

exports.getSemuaBarang = async (req, res) => {
    try {
        const semuaBarang = await Barang.findAll({
            include: [
                {
                    model: Kategori
                },
                {
                    model: statusStok
                },
                // {
                //     model: User
                // }
            ]
        });
        res.status(200).json(utils.apiSuccess("Semua barang berhasil diambil", semuaBarang));
    } catch (error) {
        console.log(error);
        res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};

exports.getBarangPenjual = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        const barangPenjual = await Barang.findAll({
            where: {
                userId: userId
            },
            include: [
                {
                    model: Kategori
                },
                {
                    model: statusStok
                }
            ]
        });
        res.status(200).json(utils.apiSuccess(`Barang dijual oleh penjual dengan ID: ${userId} berhasil diambil`, barangPenjual));
    } catch (error) {
        console.log(error);
        res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};