const router = require("express").Router();
const authController = require("../controller/auth.controller");
const userController = require("../controller/user.controller");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/user", verifyToken, userController.getUser);
router.get("/profile", verifyToken, userController.getProfile);

// router.get("/profile", verifyToken, userController.getUserProfile);
router.put("/changepassword", verifyToken, userController.changePassword);

module.exports = router;
