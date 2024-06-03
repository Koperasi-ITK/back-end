const {
  Barang,
  statusStok,
  detailTransaksi,
  Transaksi,
  statusPengiriman,
  metodePengiriman,
  Saldo,
  Kategori,
  User,
  Pendapatan,
} = require("../../models");

const ExcelJS = require('exceljs');


const pegawai = {
  async getAllBarang(req, res) {
    try {
      const allBarang = await Barang.findAll({
        include: [
          {
            model: Kategori,
            attributes: ["namaKategori"],
          },
        ],
      });
      res.status(200).json(allBarang);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
 

  async getBarangById(req, res) {
    const { id } = req.params;
    try {
      const barang = await Barang.findByPk(id, {
        include: [
          {
            model: Kategori,
            attributes: ["namaKategori"],
          },
        ],
      });
      if (!barang) {
        return res
          .status(404)
          .json({ message: "Barang dagangan tidak ditemukan" });
      }
      res.status(200).json(barang);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getBarangByStatus(req, res) {
    const { status } = req.query;
    try {
      const barangByStatus = await Barang.findAll({
        include: [
          {
            model: statusStok,
            where: { statusStok: status },
          },
          {
            model: Kategori,
            attributes: ["namaKategori"],
          },
        ],
      });
      res.status(200).json(barangByStatus);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getItemsByDeliveryStatus(req, res) {
    try {
      const status = await statusPengiriman.findOne({
        where: { statusPengirimanName: "menunggu pegawai" },
      });
      if (!status) {
        return res
          .status(404)
          .json({ message: "Status pengiriman tidak ditemukan" });
      }
      const transactions = await detailTransaksi.findAll({
        include: {
          model: Transaksi,
          where: { statusPengirimanId: status.id },
        },
      });

      if (!transactions || transactions.length === 0) {
        return res.status(404).json({
          message: "Tidak ada transaksi dengan status menunggu pegawai",
        });
      }

      res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async updateDeliveryStatus(req, res) {
    const { transaksiId } = req.params;
    const { newStatus } = req.body;

    try {
      const transaksi = await Transaksi.findByPk(transaksiId);

      if (!transaksi) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }
      transaksi.statusPengirimanId = newStatus;
      await transaksi.save();

      res.status(200).json({
        transaksi: transaksi,
        message: "Status pengiriman berhasil diperbarui",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async cancelTransaction(req, res) {
    const { transaksiId } = req.params;
    try {
      const transaksi = await Transaksi.findByPk(transaksiId, {
        include: [{ model: detailTransaksi, include: [Barang] }],
      });
      if (!transaksi) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan" });
      }

      await transaksi.update({ statusPengirimanId: 4 });

      const detailTransaksis = transaksi.detailTransaksis;
      for (const detail of detailTransaksis) {
        const barang = detail.Barang;
        const quantityCancelled = detail.jumlah;
        await barang.increment("stok", { by: quantityCancelled });
      }

      let jumlahDibatalkan = 0;
      for (const detail of detailTransaksis) {
        jumlahDibatalkan += detail.jumlah;
      }

      const totalHarga = transaksi.totalHarga;
      const userSaldo = await Saldo.findOne({
        where: { userId: transaksi.userId },
      });
      if (userSaldo) {
        await userSaldo.increment("saldoIuranSukarela", { by: totalHarga });
      }

      res.status(200).json({
        jumlah_dibatalkan: jumlahDibatalkan,
        message: "Transaksi dibatalkan",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async updateStock(req, res) {
    const { ubahStok } = req.body;
    const { barangId } = req.params;

    try {
      const barang = await Barang.findByPk(barangId);
      if (!barang) {
        return res.status(404).json({ message: "Barang tidak ditemukan" });
      }
      await barang.set("stok", ubahStok);
      await barang.save();

      res.status(200).json({
        message: "Stok barang berhasil diperbarui",
        barang: barang,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async tarikSaldoEmail(req, res) {
  const { email, amount } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const saldo = await Saldo.findOne({ where: { userId: user.id } });

    if (!saldo) {
      return res.status(404).json({ message: "Saldo not found" });
    }
    if (saldo.saldoIuranSukarela < amount) {
      return res.status(400).json({ message: "Insufficient saldo" });
    }

    await Saldo.update(
      { saldoIuranSukarela: saldo.saldoIuranSukarela - amount },
      { where: { userId: user.id } }
    );

    return res.status(200).json({ message: "Saldo successfully withdrawn" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
},


  async tarikSaldo(req, res) {
    const { userId } = req.params;
    const { jumlahPenarikan } = req.body;

    try {
      const saldo = await Saldo.findOne({ where: { userId } });

      if (!saldo) {
        return res.status(404).json({ message: "Saldo tidak ditemukan" });
      }

      if (saldo.saldoPenjualan < jumlahPenarikan) {
        return res
          .status(400)
          .json({ message: "Saldo iuran sukarela tidak mencukupi" });
      }

      saldo.saldoPenjualan -= jumlahPenarikan;

      await saldo.save();
      return res.status(200).json({ message: "Penarikan berhasil", saldo });
    } catch (error) {
      console.error("Error during withdrawal:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  },

  async getAllTransaksi(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const allTransaksi = await Transaksi.findAll({
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: metodePengiriman,
            attributes: ["metodePengirimanName"],
          },
          {
            model: statusPengiriman,
            attributes: ["statusPengirimanName"],
          },
          {
            model: detailTransaksi,
            attributes: ["jumlah"],
            include: [
              {
                model: Barang,
                attributes: ["nama", "harga"],
              },
            ],
          },
        ],
      });
      res.status(200).json(allTransaksi);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get completed transactions with pagination
  async getTransaksiSelesai(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const allTransaksi = await Transaksi.findAll({
        where: { statusPengirimanId: 8 },
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: metodePengiriman,
            attributes: ["metodePengirimanName"],
          },
          {
            model: statusPengiriman,
            attributes: ["statusPengirimanName"],
          },
          {
            model: detailTransaksi,
            attributes: ["jumlah"],
            include: [
              {
                model: Barang,
                attributes: ["nama", "harga"],
              },
            ],
          },
        ],
      });
      res.status(200).json(allTransaksi);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get ongoing transactions with pagination
  async getTransaksiBerlangsung(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const allTransaksi = await Transaksi.findAll({
        where: { statusPengirimanId: [3,4,5,6,7,9,10,11] },
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: metodePengiriman,
            attributes: ["metodePengirimanName"],
          },
          {
            model: statusPengiriman,
            attributes: ["statusPengirimanName"],
          },
          {
            model: detailTransaksi,
            attributes: ["jumlah"],
            include: [
              {
                model: Barang,
                attributes: ["nama", "harga"],
              },
            ],
          },
        ],
      });
      res.status(200).json(allTransaksi);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // Get canceled transactions with pagination
  async getTransaksiBatal(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
      const allTransaksi = await Transaksi.findAll({
        where: { statusPengirimanId: 12 },
        offset,
        limit: parseInt(limit),
        include: [
          {
            model: User,
            attributes: ["name"],
          },
          {
            model: metodePengiriman,
            attributes: ["metodePengirimanName"],
          },
          {
            model: statusPengiriman,
            attributes: ["statusPengirimanName"],
          },
          {
            model: detailTransaksi,
            attributes: ["jumlah"],
            include: [
              {
                model: Barang,
                attributes: ["nama", "harga"],
              },
            ],
          },
        ],
      });
      res.status(200).json(allTransaksi);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getAllMetodePengiriman(req, res) {
  try {
    const allMetode = await metodePengiriman.findAll();
    res.status(200).json(allMetode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
},

async getAllStatusPengiriman(req, res) {
  try {
    const allStatus = await statusPengiriman.findAll();
    res.status(200).json(allStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
},

  async getAllMetodePengiriman(req, res) {
  try {
    const allMetode = await metodePengiriman.findAll();
    res.status(200).json(allMetode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
},

async getAllStatusPengiriman(req, res) {
  try {
    const allStatus = await statusPengiriman.findAll();
    res.status(200).json(allStatus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
},
async getAllKategori(req, res) {
  try {
    const allKategori = await Kategori.findAll();
    res.status(200).json(allKategori);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
},

async updateTransaksi(req, res) {
  const { transaksiId } = req.params;
  const { metodePengirimanId, statusPengirimanId } = req.body;

  try {
    const transaksi = await Transaksi.findByPk(transaksiId);
    if (!transaksi) {
      return res.status(404).json({ message: 'Transaksi not found' });
    }

    const updates = {};

    if (metodePengirimanId !== undefined) {
      const metodePengirimanExists = await metodePengiriman.findByPk(metodePengirimanId);
      if (!metodePengirimanExists) {
        return res.status(404).json({ message: 'Metode pengiriman not found' });
      }
      updates.metodePengirimanId = metodePengirimanId;
    }

    if (statusPengirimanId !== undefined) {
      const statusPengirimanExists = await statusPengiriman.findByPk(statusPengirimanId);
      if (!statusPengirimanExists) {
        return res.status(404).json({ message: 'Status pengiriman not found' });
      }
      updates.statusPengirimanId = statusPengirimanId;
    }

    if (Object.keys(updates).length > 0) {
      await transaksi.update(updates);
      return res.status(200).json({ message: 'Transaksi updated successfully' });
    }

    res.status(400).json({ message: 'No valid fields to update' });
  } catch (error) {
    console.error('Error updating transaksi:', error);
    res.status(500).json({ message: 'Error updating transaksi' });
  }
},

async updateBarang(req, res) {
  const { id } = req.params;
  const { nama, harga, stok, kategoriId, statusStokId } = req.body;

  try {
    const barang = await Barang.findByPk(id);

    if (!barang) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    barang.nama = nama;
    barang.harga = harga;
    barang.stok = stok;
    barang.kategoriId = kategoriId;
    barang.statusStokId = statusStokId;

    await barang.save();

    res.status(200).json({
      barang: barang,
      message: "Barang berhasil diperbarui",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
},


async exportExcel(req, res) {
  try {
    const allTransaksi = await Transaksi.findAll({
      where: {
        statusPengirimanId: [8, 12],
      },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
        {
          model: metodePengiriman,
          attributes: ["metodePengirimanName"],
        },
        {
          model: statusPengiriman,
          attributes: ["statusPengirimanName"],
        },
        {
          model: detailTransaksi,
          attributes: ["jumlah"],
          include: [
            {
              model: Barang,
              attributes: ["nama", "harga"],
            },
          ],
        },
      ],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transaksi Selesai');

    worksheet.columns = [
      { header: 'Nama', key: 'nama_pengguna', width: 15 },
      { header: 'Detail Barang', key: 'detail_barang', width: 30 },
      { header: 'Metode Pengiriman', key: 'metode_pengiriman', width: 20 },
      { header: 'Status Pengiriman', key: 'status_pengiriman', width: 20 },
      { header: 'Alamat Pengiriman', key: 'alamat_pengiriman', width: 20 },
      { header: 'Total Harga', key: 'total_harga', width: 15 },
    ];

    worksheet.getRow(1).eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFF00' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    let totalTransaksi = 0;
    let totalUang = 0;
    const itemMap = new Map();

    allTransaksi.forEach(transaksi => {
      const { User, metodePengiriman, statusPengiriman, detailTransaksis } = transaksi;

      const detailBarangString = detailTransaksis.map(detailTransaksi => {
        const { Barang, jumlah } = detailTransaksi;
        const itemName = Barang?.nama ?? 'Undefined';
        if (itemMap.has(itemName)) {
          itemMap.set(itemName, {
            jumlah: itemMap.get(itemName).jumlah + (jumlah ?? 0),
            total: itemMap.get(itemName).total + (jumlah ?? 0) * (Barang?.harga ?? 0),
          });
        } else {
          itemMap.set(itemName, {
            jumlah: jumlah ?? 0,
            total: (jumlah ?? 0) * (Barang?.harga ?? 0),
          });
        }
        return `${itemName} (${jumlah ?? 0})`;
      }).join(', ');

      totalTransaksi += 1;
      totalUang += transaksi.totalHarga ?? 0;

      const row = worksheet.addRow({
        nama_pengguna: User?.name ?? 'Undefined',
        detail_barang: detailBarangString,
        metode_pengiriman: metodePengiriman?.metodePengirimanName ?? 'Undefined',
        status_pengiriman: statusPengiriman?.statusPengirimanName ?? 'Undefined',
        alamat_pengiriman: transaksi.alamatPengiriman ?? 'Undefined',
        total_harga: transaksi.totalHarga ?? 0,
      });

      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const summaryWorksheet = workbook.addWorksheet('Summary');

    summaryWorksheet.columns = [
      { header: 'Total Transaksi', key: 'total_transaksi', width: 20 },
      { header: 'Total Uang', key: 'total_uang', width: 20 },
      { header: 'Barang Terjual', key: 'barang_terjual', width: 30 },
      { header: 'Jumlah', key: 'jumlah', width: 10 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    const summaryRow = summaryWorksheet.addRow({
      total_transaksi: totalTransaksi,
      total_uang: totalUang,
    });

    summaryRow.eachCell({ includeEmpty: true }, cell => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    Array.from(itemMap.entries()).forEach(([item, { jumlah, total }]) => {
      const row = summaryWorksheet.addRow({
        barang_terjual: item,
        jumlah: jumlah,
        total: total,
      });

      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="transaksi_selesai.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
};

module.exports = pegawai;
