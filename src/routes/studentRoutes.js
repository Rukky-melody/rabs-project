const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const resultController = require('../controllers/resultController');
const { upload } = require('../config/cloudinary');

// Registration (optional photo)
router.post('/register', upload.single('photo'), studentController.registerStudent);

// Login
router.post('/login', studentController.loginStudent);

// Upload photo (existing users — one time only)
router.post('/upload-photo', upload.single('photo'), studentController.uploadPhoto);

// Result View
router.get('/my-results/:studentId', resultController.getStudentResults);

module.exports = router;