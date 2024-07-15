const router = require("express").Router();
const userController = require("../controller/user.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.get("/", verifyToken,verifyRole(3,4), userController.getUser);
router.get("/aktor", verifyToken, userController.getUserByRole);
router.get("/profile", verifyToken, userController.getProfile);
router.delete("/:id", verifyToken, userController.deleteUser);
router.put("/aktor/:id", verifyToken, verifyRole(4), userController.updateAktor);
router.patch("/profile", verifyToken, userController.updateProfile);

// router.get("/profile", verifyToken, userController.getUserProfile);
// router.put("/changepassword", verifyToken, userController.changePassword);

module.exports = router;
