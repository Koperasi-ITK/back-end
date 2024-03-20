const router = require("express").Router();
const roleController = require("../controller/role.controller");
const { verifyToken } = require("../middleware/authMiddleware");
const verifyRole = require("../middleware/checkRole");

router.get("/", verifyToken, verifyRole(4), roleController.getAll);
router.post("/", verifyToken, roleController.createRole);
router.put("/:id", verifyToken, roleController.updateRole);
router.delete("/:id", verifyToken, roleController.deleteRole);

module.exports = router;
