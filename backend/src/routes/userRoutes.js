const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, userController.getMe);
router.post('/saved', auth, userController.toggleSavedCourse);
router.post('/registrations', auth, userController.registerCourse);

module.exports = router;
