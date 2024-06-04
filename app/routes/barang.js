const router = require("express").Router();
const barangcontroller = require("../controller/barang/barang.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");
const checkStatus = require("../middleware/checkStatusAnggota");
const multer = require("multer")();

router.post("/tambah", multer.single("image"), verifyToken,verifyRole(1),barangcontroller.tambahBarang);
router.delete("/hapus/:id",verifyToken,verifyRole(1,3,4),barangcontroller.hapusBarang);
router.get("/",barangcontroller.getSemuaBarang);
router.get("/barangjualan",verifyToken,verifyRole(1),checkStatus,barangcontroller.getBarangPenjual);
router.put("/edit-barang/:id", verifyToken, verifyRole(1,4),multer.single("image"), barangcontroller.editBarang);

module.exports = router;
