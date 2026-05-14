const express = require ('express');
const { registerUser, verifyOTP, login, forgetPassword, resetPassword, getAllUsers, deleteUser } = require('../controllers/AuthController');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);

router.post('/verify-otp', verifyOTP);

router.post('/login', login);

router.post('/forget-password', forgetPassword);

router.post('/reset-password', resetPassword);

router.get('/users', protect, authorize('admin'), getAllUsers);

router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;