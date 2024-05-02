const router = require("express").Router();
const authController = require("../controller/auth.controller");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.put("/changepassword", verifyToken, authController.changePassword);

module.exports = router;
