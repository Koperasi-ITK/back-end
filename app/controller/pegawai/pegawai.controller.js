const {
  Barang,
  statusStok,
  detailTransaksi,
  Transaksi,
  statusPengiriman,
  Saldo,
  User
} = require("../../models");

const pegawai = {
  async getAllBarang(req, res) {
    try {
      const allBarang = await Barang.findAll();
      res.status(200).json(allBarang);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  async getBarangById(req, res) {
  const { id } = req.params;
  try {
    const barang = await Barang.findByPk(id);
    if (!barang) {
      return res.status(404).json({ message: "Barang dagangan tidak ditemukan" });
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
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }
    await barang.set("stok", ubahStok);
    await barang.save();

    res.status(200).json({ 
      message: 'Stok barang berhasil diperbarui',
    barang : barang });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
},

async tarikSaldo(req,res) {
  const { userId } = req.params;
  const { jumlahPenarikan } = req.body;

    try {
      const saldo = await Saldo.findOne({ where: { userId } });

      if (!saldo) {
        return res.status(404).json({ message: 'Saldo tidak ditemukan' });
      }

      if (saldo.saldoPenjualan < jumlahPenarikan) {
        return res.status(400).json({ message: 'Saldo iuran sukarela tidak mencukupi' });
      }

      saldo.saldoPenjualan -= jumlahPenarikan;

      await saldo.save();
      return res.status(200).json({ message: 'Penarikan berhasil', saldo });
    } catch (error) {
      console.error('Error during withdrawal:', error);
      return res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }

}
};

module.exports = pegawai;
