const express = require('express');
const { getAllAppointments, approveAppointment, rejectAppointment } = require('../controllers/EmployeeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(authorize("employee", "admin"));

router.get('/appointments', getAllAppointments);
router.put('/appointments/:appointmentId/approve', approveAppointment);
router.put('/appointments/:appointmentId/reject', rejectAppointment);

module.exports = router;