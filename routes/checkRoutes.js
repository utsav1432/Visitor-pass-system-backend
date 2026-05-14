const express = require('express');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scanQRCode, getAllchecks } = require('../controllers/CheckInOutController');
const router = express.Router();

router.use(protect);
router.use(authorize("security", "admin"));

router.post('/scan', scanQRCode);

router.get('/all', getAllchecks);

module.exports = router;