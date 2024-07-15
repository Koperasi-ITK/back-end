const { Keranjang, itemKeranjang, Barang, User,Kategori } = require("../../models");
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
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const keranjang = await Keranjang.findOne({ where: { userId } });
    if (!keranjang) {
      return res.status(404).json(utils.apiError("Keranjang tidak ditemukan"));
    }

    let { rows: items, count: totalItems } = await itemKeranjang.findAndCountAll({
      where: { keranjangId: keranjang.id },
      include: [{
        model: Barang,
        as: 'Barang',
        attributes: ['nama', 'harga', 'urlGambar', 'stok', 'statusStokId'],
        include: [{
          model: Kategori,
          attributes: ['potonganHarga']
        }]
      }],
      limit,
      offset
    });

    if (items.length === 0) {
      return res.status(200).json(utils.apiSuccess("Keranjang kosong", []));
    }

    let itemsToRemove = [];
    for (const item of items) {
      if (!item.Barang || item.Barang.stok === 0 || item.Barang.statusStokId === 2) {
        itemsToRemove.push(item.id);
      }
    }

    if (itemsToRemove.length > 0) {
      await itemKeranjang.destroy({ where: { id: itemsToRemove } });
      const newItemsResult = await itemKeranjang.findAndCountAll({
        where: { keranjangId: keranjang.id },
        include: [{
          model: Barang,
          as: 'Barang',
          attributes: ['nama', 'harga', 'urlGambar', 'stok', 'statusStokId'],
          include: [{
            model: Kategori,
            attributes: ['potonganHarga']
          }]
        }],
        limit,
        offset
      });
      items = newItemsResult.rows;
      totalItems = newItemsResult.count;
    }

    if (items.length === 0) {
      return res.status(200).json(utils.apiSuccess("Keranjang kosong setelah penghapusan item yang tidak tersedia", []));
    }

    const totalHarga = items.reduce((sum, item) => {
      const potonganHarga = item.Barang.Kategori.potonganHarga || 0;
      const hargaFinal = item.Barang.harga + potonganHarga;
      return sum + (hargaFinal * item.jumlah);
    }, 0);

    const simplifiedItems = items.map(item => {
      const potonganHarga = item.Barang.Kategori.potonganHarga || 0;
      const hargaFinal = item.Barang.harga + potonganHarga;
      return {
        id: item.id,
        namaBarang: item.Barang.nama,
        harga: hargaFinal,
        jumlah: item.jumlah,
        subTotal: hargaFinal * item.jumlah,
        urlGambar: item.Barang.urlGambar
      };
    });

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json(utils.apiSuccess("Item di keranjang", {
      items: simplifiedItems,
      totalHarga,
      currentPage: page,
      totalPages,
      totalItems
    }));
  } catch (error) {
    console.log(error);
    return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
  }
};

exports.hapusDariKeranjang = async (req, res) => {
    const userId = res.locals.user.id;
    const { itemKeranjangId } = req.params;

    try {
        const item = await itemKeranjang.findOne({
            where: {
                id: itemKeranjangId,
                keranjangId: (await Keranjang.findOne({ where: { userId } })).id
            }
        });

        if (!item) {
            return res.status(404).json(utils.apiError("Item tidak ditemukan di keranjang"));
        }

        await item.destroy();
        return res.status(200).json(utils.apiSuccess("Item telah dihapus dari keranjang"));
    } catch (error) {
        console.log(error);
        return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
};

exports.ubahJumlahDiKeranjang = async (req, res) => {
    const userId = res.locals.user.id;
    const { itemKeranjangId, jumlahBaru } = req.body;
  
    try {
      const item = await itemKeranjang.findOne({
        where: {
          id: itemKeranjangId,
          keranjangId: (await Keranjang.findOne({ where: { userId } })).id
        },
        include: [Barang]
      });
  
      if (!item) {
        return res.status(404).json(utils.apiError("Item tidak ditemukan di keranjang"));
      }
  
      if (jumlahBaru > item.Barang.stok) {
        return res.status(400).json(utils.apiError("Jumlah yang diminta melebihi stok yang tersedia"));
      }
  
      if (jumlahBaru === 0) {
        await item.destroy();
        return res.status(200).json(utils.apiSuccess("Item telah dihapus dari keranjang"));
      } else {
        item.jumlah = jumlahBaru;
        await item.save();
        return res.status(200).json(utils.apiSuccess("Jumlah item di keranjang berhasil diperbarui", item));
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json(utils.apiError("Kesalahan pada internal server", { error: error.message }));
    }
  };