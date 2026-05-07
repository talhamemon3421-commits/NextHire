const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    getSavedJobs, 
    saveJob, 
    removeSavedJob 
} = require('../controllers/jobController');

// All routes here require authentication
router.get('/saved', auth, getSavedJobs);
router.post('/save/:id', auth, saveJob);
router.delete('/save/:id', auth, removeSavedJob);

module.exports = router;