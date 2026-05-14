const express = require('express');
const { registerVisitor, downloadPassPDF, getAllVisitors, getVisitorById } = require('../controllers/VisitorController')
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerVisitor);

router.post('/pass/download', downloadPassPDF);

router.get('/', protect, authorize("admin", "employee"), getAllVisitors);

router.get('/:id', protect, authorize("admin", "employee", "security"), getVisitorById);

module.exports = router;