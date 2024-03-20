const express = require("express");
const Auth = require("./User");
const Role = require("./role");
const Category = require("./category");
const router = express.Router();

router.use("/auth", Auth);
router.use("/role", Role);
router.use("/category", Category);

module.exports = router;
