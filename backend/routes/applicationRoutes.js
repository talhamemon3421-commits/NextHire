const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    uploadResume, getUserResumes, applyToJob, 
    withdrawApplication 
} = require('../controllers/applicationController');

// Resume Routes
router.post('/resume', auth, uploadResume);
router.get('/resume', auth, getUserResumes);

// Application Routes
router.post('/apply', auth, applyToJob);
router.put('/withdraw/:id', auth, withdrawApplication);
router.get('/my-applications', auth, async (req, res) => {
    const apps = await Application.find({ applicant: req.user.id })
        .populate('job', 'title location salary')
        .sort('-createdAt');
    res.json(apps);
});

module.exports = router;