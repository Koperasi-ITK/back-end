const router = require("express").Router();
const categoryController = require("../controller/category.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");
const multer = require("multer")();

router.post("/", multer.single("image"), verifyToken, categoryController.createCategory);
router.get("/", verifyToken, categoryController.getAll);
router.delete("/:id", verifyToken, verifyRole(4), categoryController.deleteCategory);
router.put("/:id", verifyToken, verifyRole(4), categoryController.updateCategory);

module.exports = router;
