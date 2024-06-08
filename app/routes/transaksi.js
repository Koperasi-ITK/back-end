const router = require("express").Router();
const transaksicontroller = require("../controller/transaksi/transaksi.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.post("/checkout", verifyToken, verifyRole(1), transaksicontroller.checkout);
router.post("/cancel", verifyToken, verifyRole(1), transaksicontroller.cancelCheckout);
router.get(
  "/gettransaksi/:statusPengiriman?/:transaksiId?",
  verifyToken,
  verifyRole(1),
  transaksicontroller.getTransaksi
);
router.post('/cancel-checkout-by-employee', verifyToken,verifyRole(3), transaksicontroller.cancelCheckoutByEmployee);
router.post('/updateStatusPengiriman',verifyToken,verifyRole(3), transaksicontroller.updateStatusPengiriman);
router.get("/getSalesHistory", verifyToken, verifyRole(1,2), transaksicontroller.getSalesHistory);
router.get("/getAllTransaksi", verifyToken, verifyRole(4,3), transaksicontroller.getAllTransaksi);

router.post(
  "/Konfirmasi/:transaksiId",
  verifyToken,
  verifyRole(1),
  transaksicontroller.BarangDiterima
);

module.exports = router;
