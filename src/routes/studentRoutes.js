const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const resultController = require('../controllers/resultController');

router.post('/register', studentController.registerStudent);
router.post('/login', studentController.loginStudent);


// Result View
router.get('/my-results/:studentId', resultController.getStudentResults);

module.exports = router;