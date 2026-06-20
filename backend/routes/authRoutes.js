const express = require('express');
const router = express.Router();
const { login, getMe, changePassword, register } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

module.exports = router;
