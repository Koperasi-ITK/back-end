const router = require("express").Router(),
  saldo = require("../controller/saldo/saldo.controller"),
  { verifyToken } = require("../middleware/authMiddleware"),
  verifyRole = require("../middleware/checkRole");

router.put("/:email", verifyToken, verifyRole(4), saldo.addSaldo);
router.get("/", verifyToken, verifyRole(4), saldo.RiwayatTopUp);
router.get("/user", verifyToken, saldo.saldoUser);
router.post("transfer",verifyToken,saldo.transferSaldoPenjualanToSukarela);
router.get("/pendapatan", verifyToken, verifyRole(4), saldo.getPendapatan);
router.put("/biaya/:id", verifyToken, verifyRole(4), saldo.editBiaya);
router.get("/biaya", saldo.getBiaya);

module.exports = router;
