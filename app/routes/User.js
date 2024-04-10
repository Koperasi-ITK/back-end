const router = require("express").Router();
const userController = require("../controller/user.controller");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, userController.getUser);
router.get("/aktor", verifyToken, userController.getUserByRole);
router.get("/profile", verifyToken, userController.getProfile);
router.delete("/:id", verifyToken, userController.deleteUser);

// router.get("/profile", verifyToken, userController.getUserProfile);
// router.put("/changepassword", verifyToken, userController.changePassword);

module.exports = router;
