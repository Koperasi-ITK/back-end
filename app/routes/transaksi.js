const router = require("express").Router();
const transaksicontroller = require("../controller/transaksi/transaksi.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.post("/checkout",verifyToken,verifyRole(1),transaksicontroller.checkout);
router.post("/cancel",verifyToken,verifyRole(1),transaksicontroller.cancelCheckout);
router.get("/gettransaksi/:statusPengiriman?/:transaksiId?", verifyToken, verifyRole(1), transaksicontroller.getTransaksi);

module.exports = router;