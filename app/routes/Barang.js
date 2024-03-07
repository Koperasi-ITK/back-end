const express = require('express');
const router = express.Router();
const barangController = require('../controller/BarangController');
const upload = require('../../config/multerConfig');
const { verifyToken,verifyRole } = require('../middleware/authMiddleware');

router.post('/tambah',verifyToken,verifyRole(['pengguna','penitip']), upload.single('gambar'), barangController.tambahBarang);

module.exports = router;
