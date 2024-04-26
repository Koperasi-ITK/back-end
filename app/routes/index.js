const express = require("express");
const Auth = require("./User");
const Role = require("./role");
const Category = require("./category");
const barang = require("./barang");
const keranjang = require("./keranjang");
const pegawai = require("./pegawai");
const router = express.Router();

router.use("/auth", Auth);
router.use("/role", Role);
router.use("/category", Category);
router.use("/barang",barang);
router.use("/keranjang",keranjang);
router.use("/pegawai",pegawai);


module.exports = router;
