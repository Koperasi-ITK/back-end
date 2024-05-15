const router = require("express").Router();
const saldorcontroller = require("../controller/saldo/saldo.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.post("/", verifyToken,verifyRole(1),saldorcontroller.transferSaldoPenjualanToSukarela);
router.get("/",verifyToken,verifyRole(1),saldorcontroller.checkAllSaldo);

module.exports = router;