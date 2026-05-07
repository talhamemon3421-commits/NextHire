const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { chatWithAI } = require('../controllers/aiController');

router.post('/chat', auth, chatWithAI);

module.exports = router;