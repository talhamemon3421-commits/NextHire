const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getNotifications, 
    markAsRead, 
    markAllRead, 
    deleteNotification 
} = require('../controllers/notificationController');

router.get('/', auth, getNotifications);
router.put('/read-all', auth, markAllRead);
router.put('/:id', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;