const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const resultController = require('../controllers/resultController');

router.post('/login', authController.loginStaff);

// Result Management
router.post('/upload-score', resultController.uploadScore);

module.exports = router;