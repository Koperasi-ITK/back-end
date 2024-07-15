const router = require("express").Router();
const adminController = require("../controller/admin.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");
const checkStatus = require("../middleware/checkStatusAnggota");

router.get("/",verifyToken,verifyRole(4),adminController.getLogs);

module.exports = router;