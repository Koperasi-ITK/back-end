const utils = require("../../../utils/utils");
const ImageKitFile = require("../../../utils/ImageKit");
const { Barang, Kategori, statusStok, User,statusAnggota } = require("../../models");
const { Op } = require('sequelize');

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

    if (harga <= 0)
      return res.status(400).json(utils.apiError("Harga harus lebih dari 0"));

    if (stok < 0)
      return res.status(400).json(utils.apiError("Stok tidak boleh kurang dari 0"));

    const uploadFile = await ImageKitFile.upload(image);

    if (!uploadFile)
      return res.status(409).json(utils.apiError("Gagal mengupload gambar"));

    const barangBaru = await Barang.create({
      nama,
      harga,
      stok,
      kategoriId,
      userId,
      statusStokId,
      urlGambar: uploadFile.url,
    });

    res.status(201).json(utils.apiSuccess("Barang berhasil ditambahkan", barangBaru));
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
  }
};

exports.hapusBarang = async (req, res) => {
    try {
        const barangId = req.params.id;
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const barang = await Barang.findByPk(barangId);

        if (!barang) {
            return res.status(404).json(utils.apiError("Barang tidak ditemukan"));
        }
        console.log(`User ID: ${userId}, User Role: ${userRole}, Barang User ID: ${barang.userId}`);
        if (barang.userId !== userId && userRole !== 4 && userRole !== 3) {
            return res.status(403).json(utils.apiError("Anda tidak memiliki izin untuk menghapus barang ini"));
        }

        const urlGambar = barang.urlGambar;
        const namaFile = urlGambar.substring(urlGambar.lastIndexOf('/') + 1);
        const imageDeleteSuccess = await ImageKitFile.delete(namaFile);
        if (!imageDeleteSuccess) {
            return res.status(500).json(utils.apiError("Gagal menghapus gambar"));
        }
        await Barang.destroy({
            where: { id: barangId }
        });

        res.status(200).json(utils.apiSuccess("Barang dan gambar berhasil dihapus"));
    } catch (error) {
        console.error(error);
        res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
    
};

exports.getSemuaBarang = async (req, res) => {
  try {
      const { id, nama, kategori, page = 1, limit = 10 } = req.query;
      const whereClause = {};
      const includeClause = [
          {
              model: Kategori,
              attributes: ['namaKategori', 'potonganHarga']
          },
          {
              model: User,
              attributes: ['name'],
              include: [
                  {
                      model: statusAnggota,
                      attributes: ['statusName'],
                      where: {
                          statusName: 'Aktif'
                      }
                  }
              ],
              required: true
          },
          {
              model: statusStok,
              attributes: ['statusStok']
          }
      ];

      if (id) {
          whereClause.id = id;
      }

      if (nama) {
          whereClause.nama = {
              [Op.like]: `%${nama.toLowerCase()}%`
          };
      }

      if (kategori) {
          includeClause.push({
              model: Kategori,
              attributes: ['namaKategori', 'potonganHarga'],
              where: {
                  namaKategori: {
                      [Op.like]: `%${kategori.toLowerCase()}%`
                  }
              }
          });
      }

      const offset = (page - 1) * limit;
      const semuaBarang = await Barang.findAndCountAll({
          where: whereClause,
          attributes: ['id', 'nama', 'harga', 'urlGambar', 'stok'],
          include: includeClause,
          offset: offset,
          limit: parseInt(limit),
          order: [['createdAt', 'DESC']]
      });

      if (semuaBarang.rows.length === 0) {
          return res.status(404).json(utils.apiError("Barang tidak ditemukan atau kosong"));
      }

      const items = semuaBarang.rows.map(item => {
          const hargaAsli = item.harga;
          const potonganHarga = item.Kategori.potonganHarga || 0;
          const hargaFinal = hargaAsli + potonganHarga;
          return {
              ...item.get(),
              harga: hargaFinal
          };
      });

      res.status(200).json(utils.apiSuccess("Semua barang berhasil diambil", {
          totalItems: semuaBarang.count,
          totalPages: Math.ceil(semuaBarang.count / limit),
          currentPage: page,
          items: items
      }));
  } catch (error) {
      console.error(error);
      res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
  }
};

exports.getBarangPenjual = async (req, res) => {
    try {
      const userId = res.locals.user.id;
      const { page = 1, limit = 10, nama, kategori, sortBy, sortOrder = 'ASC', statusStok: statusStokFilter } = req.query;
  
      const offset = (page - 1) * limit;
      const whereClause = { userId: userId };
      const includeClause = [
        { model: Kategori },
        { model: statusStok }
      ];
      const orderClause = [];
  
      if (nama) {
        whereClause.nama = {
          [Op.like]: `%${nama.toLowerCase()}%`
        };
      }
  
      if (kategori) {
        includeClause.push({
          model: Kategori,
          where: {
            namaKategori: {
              [Op.like]: `%${kategori.toLowerCase()}%`
            }
          }
        });
      }
  
      if (statusStokFilter) {
        includeClause.push({
          model: statusStok,
          where: {
            statusStok: statusStokFilter.toLowerCase()
          }
        });
      }
  
      switch (sortBy) {
        case 'date':
          orderClause.push(['createdAt', sortOrder]);
          break;
        case 'price':
          orderClause.push(['harga', sortOrder]);
          break;
        case 'stock':
          orderClause.push(['stok', sortOrder]);
          break;
        case 'status':
          orderClause.push([statusStok, 'statusStok', sortOrder]);
          break;
        default:
          orderClause.push(['createdAt', 'DESC']);
          break;
      }
  
      const barangPenjual = await Barang.findAndCountAll({
        where: whereClause,
        include: includeClause,
        offset: offset,
        limit: parseInt(limit),
        order: orderClause
      });
  
      if (barangPenjual.rows.length === 0) {
        return res.status(404).json(utils.apiError("Tidak ada barang yang di jual"));
      }
  
      res.status(200).json(utils.apiSuccess(`Barang dijual oleh penjual dengan ID: ${userId} berhasil diambil`, {
        totalItems: barangPenjual.count,
        totalPages: Math.ceil(barangPenjual.count / limit),
        currentPage: page,
        items: barangPenjual.rows
      }));
    } catch (error) {
      console.log(error);
      res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
  };

  exports.editBarang = async (req, res) => {
    try {
        const barangId = req.params.id;
        const { nama, harga, stok, kategoriId, statusStokId } = req.body;
        const userId = res.locals.user.id;
        const userRole = res.locals.user.role;
        const image = req.file;

        let barang;
        if (userRole === 4) {
            barang = await Barang.findOne({
                where: { id: barangId }
            });
        } else {
            barang = await Barang.findOne({
                where: {
                    id: barangId,
                    userId: userId
                }
            });
        }

        if (!barang) {
            return res.status(404).json(utils.apiError("Barang tidak ditemukan atau Anda tidak memiliki hak untuk mengedit barang ini."));
        }

        if (image) {
            const namaFile = barang.urlGambar.substring(barang.urlGambar.lastIndexOf('/') + 1);
            const imageDeleteSuccess = await ImageKitFile.delete(namaFile);

            if (!imageDeleteSuccess) {
                return res.status(500).json(utils.apiError("Gagal menghapus gambar"));
            }

            const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
            const allowedSizeMb = 2;

            if (!allowedMimes.includes(image.mimetype))
                return res.status(409).json(utils.apiError("Format gambar tidak diperbolehkan"));

            if (image.size / (1024 * 1024) > allowedSizeMb)
                return res.status(409).json(utils.apiError("Gambar tidak boleh lebih dari 2mb"));

            const uploadFile = await ImageKitFile.upload(image);

            if (!uploadFile) {
                return res.status(409).json(utils.apiError("Gagal mengupload gambar"));
            }

            barang.urlGambar = uploadFile.url;
        }

        if (nama !== undefined) barang.nama = nama;
        if (harga !== undefined) {
            if (harga <= 0) {
                return res.status(400).json(utils.apiError("Harga harus lebih dari 0"));
            }
            barang.harga = harga;
        }
        if (stok !== undefined) {
            if (stok < 0) {
                return res.status(400).json(utils.apiError("Stok tidak boleh kurang dari 0"));
            }
            barang.stok = stok;
        }
        if (kategoriId !== undefined) barang.kategoriId = kategoriId;
        if (statusStokId !== undefined) barang.statusStokId = statusStokId;

        await barang.save();
        res.status(200).json(utils.apiSuccess("Barang berhasil diperbarui", barang));
    } catch (error) {
        console.log(error);
        res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};
