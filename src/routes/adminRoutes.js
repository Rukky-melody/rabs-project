const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-staff', authController.registerStaff);

module.exports = router;