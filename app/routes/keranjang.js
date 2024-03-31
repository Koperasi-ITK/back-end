const router = require("express").Router();
const keranjangController = require("../controller/keranjang/keranjang.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.post('/tambah-ke-keranjang', verifyToken,verifyRole(1), keranjangController.tambahKeKeranjang);
router.get('/', verifyToken,verifyRole(1), keranjangController.getBarangDiKeranjang);
module.exports = router;