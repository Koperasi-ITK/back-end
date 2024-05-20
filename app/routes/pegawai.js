const express = require("express");
const router = express.Router();
const pegawaiController = require("../controller/pegawai/pegawai.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.get("/barang",verifyToken,verifyRole(3), pegawaiController.getAllBarang);
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
router.post(
  "/saldo/:userId/tarik-saldo",
  verifyToken,
  verifyRole(3),
  pegawaiController.tarikSaldo
);

module.exports = router;
