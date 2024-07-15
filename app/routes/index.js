const express = require("express");
const User = require("./User");
const Auth = require("./auth");
const Role = require("./role");
const Category = require("./category");
const barang = require("./barang");
const keranjang = require("./keranjang");
const pegawai = require("./pegawai");
const transaksi = require("./transaksi");
const saldo = require("./saldo");
const admin = require("./admin");
const router = express.Router();


router.use("/auth", Auth);
router.use("/user", User);
router.use("/role", Role);
router.use("/category", Category);
router.use("/barang",barang);
router.use("/keranjang",keranjang);
router.use("/pegawai",pegawai);
router.use("/transaksi",transaksi);
router.use("/saldo",saldo);
router.use("/admin",admin);


module.exports = router;
