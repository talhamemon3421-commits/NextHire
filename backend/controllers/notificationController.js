const { Notification } = require('../models/User'); // Adjust path to your unified schema file

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort('-createdAt')
            .populate('relatedJob', 'title')
            .populate('relatedApplication', 'status');
            
        res.json(notifications);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Mark a single notification as read
// @route   PUT /api/notifications/:id
exports.markAsRead = async (req, res) => {
    try {
        let notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ msg: 'Notification not found' });
        
        // Ensure user owns this notification [cite: 198]
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        notification.isRead = true; 
        notification.readAt = Date.now(); 
        
        await notification.save();
        res.json(notification);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
exports.markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true, readAt: Date.now() } } 
        );
        res.json({ msg: 'All marked as read' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (notification.recipient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        await notification.deleteOne();
        res.json({ msg: 'Notification removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};