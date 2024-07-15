const express = require("express");
const router = express.Router();
const pegawaiController = require("../controller/pegawai/pegawai.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.get(
  "/barang",
  verifyToken,
  verifyRole(3),
  pegawaiController.getAllBarang
);
router.get(
  "/barang/:id",
  verifyToken,
  verifyRole(3),
  pegawaiController.getBarangById
);
router.get(
  "/barang-status",
  verifyToken,
  verifyRole(3),
  pegawaiController.getBarangByStatus
);
router.put(
  "/barang/update/:id",
  verifyToken,
  verifyRole(3),
  pegawaiController.updateBarang
);
router.get(
  "/transaksi/status-menunggu-pegawai",
  verifyToken,
  verifyRole(3),
  pegawaiController.getItemsByDeliveryStatus
);
router.put(
  "/transaksi/:transaksiId/update-status-pengiriman",
  verifyToken,
  verifyRole(3),
  pegawaiController.updateDeliveryStatus
);
router.put(
  "/transaksi/:transaksiId/transaksi-batal",
  verifyToken,
  verifyRole(3),
  pegawaiController.cancelTransaction
);
router.put(
  "/barang/:barangId/ubah-stok",
  verifyToken,
  verifyRole(3),
  pegawaiController.updateStock
);
router.get(
  "/transaksi/data-penjualan",
  verifyToken,
  verifyRole(3),
  pegawaiController.getAllTransaksi
);
router.get(
  "/transaksi/data-penjualan/batal",
  verifyToken,
  verifyRole(3),
  pegawaiController.getTransaksiBatal
);
router.get(
  "/transaksi/data-penjualan/selesai",
  verifyToken,
  verifyRole(3),
  pegawaiController.getTransaksiSelesai
);
router.get(
  "/transaksi/data-penjualan/berlangsung",
  verifyToken,
  verifyRole(3),
  pegawaiController.getTransaksiBerlangsung
);

router.put(
  "/transaksi/data-penjualan/:transaksiId",
  verifyToken,
  verifyRole(3),
  pegawaiController.updateTransaksi
);
router.get("/transaksi/metodePengiriman",verifyToken,verifyRole(3),pegawaiController.getAllMetodePengiriman);
router.get("/transaksi/statusPengiriman",verifyToken,verifyRole(3), pegawaiController.getAllStatusPengiriman);
router.get(
  "/transaksi/kategori",
  verifyToken,
  verifyRole(3),
  pegawaiController.getAllKategori
);
router.get(
  "/transaksi/download",
  verifyToken,
  verifyRole(3),
  pegawaiController.exportExcel
);
router.post(
  "/saldo/tarik-saldo",
  verifyToken,
  verifyRole(3),
  pegawaiController.tarikSaldoEmail
);

module.exports = router;
