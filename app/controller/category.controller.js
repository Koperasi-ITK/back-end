const utils = require("../../utils/utils");
const ImageKitFile = require("../../utils/ImageKit");
const { Kategori } = require("../models");

const createCategory = async (req, res) => {
  try {
    const image = req.file;

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

    console.log(uploadFile.url);

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
    const checkCategory = await Kategori.findByPk(id);

    // console.log(checkCategory.image);

    if (!checkCategory)
      return res.status(404).json(utils.apiError("Kategori tidak di temukan"));

    // console.log(checkCategory);

    const deleteFile = await ImageKitFile.delete(checkCategory.image);

    if (!deleteFile) return res.status(500).json(utils.apiError("Gagal Menghapus File"));

    await Kategori.destroy({
      where: {
        id: id,
      },
    });

    return res.status(200).json(utils.apiSuccess("Berhasil Menghapus Kategori"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = res.locals.user.id;

    const checkCategory = await Kategori.findByPk(id);

    if (!checkCategory)
      return res.status(404).json(utils.apiError("Kategori tidak ditemukan"));

    const image = req.file;

    const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

    const allowedSizeMb = 2;

    let imageUrl = null;

    if (typeof image === "undefined") {
      imageUrl = checkCategory.imageUrl;
      imageFileName = checkCategory.imageFileName;
    } else {
      if (!allowedMimes.includes(image.mimetype))
        return res.status(409).json(utils.apiError("Format gambar tidak diperbolehkan"));

      if (image.size / (1024 * 1024) > allowedSizeMb)
        return res
          .status(409)
          .json(utils.apiError("Gambar kelas tidak boleh lebih dari 2mb"));

      if (checkCategory.imageFileName != null) {
        const deleteFile = await ImageKitFile.delete(checkCategory.image);
        if (!deleteFile)
          return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
      }

      const uploadFile = await ImageKitFile.upload(image);

      if (!uploadFile)
        return res.status(500).json(utils.apiError("Kesalahan pada internal server"));

      imageUrl = uploadFile.url;
      imageFileName = uploadFile.name;
    }
    const { namaKategori, potonganHarga } = req.body;

    console.log(namaKategori, potonganHarga);

    const checkName = await Kategori.findOne({
      where: {
        namaKategori,
      },
    });

    if (checkName)
      return res.status(409).json(utils.apiError("Nama Kategori Sudah Terdaftar"));

    await Kategori.update(
      {
        data: {
          namaKategori: namaKategori,
          image: imageUrl,
          potonganHarga: potonganHarga,
        },
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.status(200).json(utils.apiSuccess("Berhasil Mengubah Kategori"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server"));
  }
};

module.exports = {
  createCategory,
  getAll,
  deleteCategory,
  updateCategory,
};
