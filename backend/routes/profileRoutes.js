const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

// This matches: GET http://localhost:5000/api/profile/me
router.get('/me', auth, getProfile);

// This matches: POST http://localhost:5000/api/profile/
router.post('/', auth, updateProfile);

module.exports = router;