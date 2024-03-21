const router = require("express").Router();
const barangcontroller = require("../controller/barang/barang.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");
const multer = require("multer")();

router.post("/tambah", multer.single("image"), verifyToken,verifyRole(1),barangcontroller.tambahBarang);
router.delete("/hapus/:id",verifyToken,verifyRole(1),barangcontroller.hapusBarang);
router.get("/",barangcontroller.getSemuaBarang);
router.get("/barangjualan",verifyToken,verifyRole(1),barangcontroller.getBarangPenjual);

module.exports = router;