const router = require("express").Router(),
  saldo = require("../controller/saldo/saldo.controller"),
  { verifyToken } = require("../middleware/authMiddleware"),
  verifyRole = require("../middleware/checkRole");

router.put("/:email", verifyToken, verifyRole(4), saldo.addSaldo);

module.exports = router;
