const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(verifyAdmin);

router.post('/register-staff', authController.registerStaff);
router.get('/staffs', adminController.getStaffs);
router.get('/students', adminController.getStudentsByClass);
router.get('/results/search', adminController.searchPublishedResults);

module.exports = router;