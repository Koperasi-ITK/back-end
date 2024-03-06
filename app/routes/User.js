const express = require('express');
const userController = require('../controller/UserController')
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);

router.get('/profile', verifyToken, userController.getUserProfile);
// router.put('/profile', verifyToken, userController.updateUserProfile);

module.exports = router;