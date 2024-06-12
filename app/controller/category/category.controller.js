const utils = require("../../../utils/utils");
const ImageKitFile = require("../../../utils/ImageKit");
const { Kategori } = require("../../models");
const { where } = require("sequelize");
const { logAction,getCurrentTime } = require('../../../utils/Logging');

const createCategory = async (req, res) => {
  try {
    const image = req.file;
    const userId = res.locals.user.id;

    if (typeof image === "undefined")
      return res.status(422).json(utils.apiError("Gambar tidak boleh kosong"));

    const { namaKategori, potonganHarga } = req.body;

    const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const allowedSizeMb = 2;

    if (!allowedMimes.includes(image.mimetype))
      return res.status(409).json(utils.apiError("Format gambar tidak diperbolehkan"));

    if (image.size / (1024 * 1024) > allowedSizeMb)
      return res
        .status(409)
        .json(utils.apiError("Gambar kategori tidak boleh lebih dari 2mb"));

    const uploadFile = await ImageKitFile.upload(image);

    if (!uploadFile) return res.status(409).json(utils.apiError("Url kosong"));

    await Kategori.create({
      namaKategori: namaKategori,
      image: uploadFile.url,
      potonganHarga: potonganHarga,
    });
    await logAction(userId, 'Menambah Category', new Date(), getCurrentTime());
    return res.status(200).json(utils.apiSuccess("Berhasil menambah kategori"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada Internal Server"));
  }
};

const getAll = async (req, res) => {
  try {
    const category = await Kategori.findAll();
    const data = {
      category,
    };

    res.status(200).json(utils.apiSuccess("Berhasil mengambil data Category", data));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = res.locals.user.id;
    const checkCategory = await Kategori.findByPk(id);

    // console.log(checkCategory.image);

    if (!checkCategory)
      return res.status(404).json(utils.apiError("Kategori tidak di temukan"));

    const image = checkCategory.image;
    const nameFile = image.substring(image.lastIndexOf("/") + 1);
    const deleteFile = await ImageKitFile.delete(nameFile);

    if (!deleteFile) return res.status(500).json(utils.apiError("Gagal Menghapus File"));

    await Kategori.destroy({
      where: {
        id: id,
      },
    });
    await logAction(userId, 'Menghapus Category', new Date(), getCurrentTime());
    return res.status(200).json(utils.apiSuccess("Berhasil Menghapus Kategori"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = res.locals.user.id;
    const { namaKategori, potonganHarga } = req.body;
    const image = req.file;
    const checkCategory = await Kategori.findOne({ where: { id: id } });

    if (!checkCategory) {
      return res.status(404).json(utils.apiError("Kategori tidak ditemukan"));
    }

    const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const allowedSizeMb = 2;

    let imageUrl = checkCategory.image;
    let imageFileName = checkCategory.image
      ? checkCategory.image.substring(checkCategory.image.lastIndexOf("/") + 1)
      : null;

    if (image) {
      if (!allowedMimes.includes(image.mimetype)) {
        return res.status(409).json(utils.apiError("Format gambar tidak diperbolehkan"));
      }

      if (image.size / (1024 * 1024) > allowedSizeMb) {
        return res.status(409).json(utils.apiError("Gambar tidak boleh lebih dari 2MB"));
      }

      if (checkCategory.image) {
        try {
          const imageDeleteSuccess = await ImageKitFile.delete(imageFileName);

          if (!imageDeleteSuccess) {
            console.error("Gagal menghapus gambar lama");
          }
        } catch (deleteError) {
          console.error("Error saat menghapus gambar:", deleteError.message);
        }
      }

      const uploadFile = await ImageKitFile.upload(image);

      if (!uploadFile) {
        return res.status(409).json(utils.apiError("Gagal mengupload gambar"));
      }

      imageUrl = uploadFile.url;
      imageFileName = uploadFile.name;
    }

    if (namaKategori && namaKategori !== checkCategory.namaKategori) {
      const checkName = await Kategori.findOne({ where: { namaKategori } });
      if (checkName) {
        return res.status(409).json(utils.apiError("Nama Kategori Sudah Terdaftar"));
      }
    }
    
    const updateData = {
      namaKategori: namaKategori || checkCategory.namaKategori,
      image: imageUrl,
      potonganHarga: potonganHarga !== undefined ? potonganHarga : checkCategory.potonganHarga,
    };
    
    await Kategori.update(updateData, { where: { id: id } });
    await logAction(userId, 'Mengupdate Category', new Date(), getCurrentTime());
    return res.status(200).json(utils.apiSuccess("Berhasil Mengubah Kategori"));
  } catch (error) {
    return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
  }
};

module.exports = {
  createCategory,
  getAll,
  deleteCategory,
  updateCategory,
};
