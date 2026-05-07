const { Job, Application } = require('../models/User'); // Adjust path to your schema
const SavedJob = require('../models/SavedJob'); // Using the schema created for bookmarks

// @desc    Get all saved jobs for the logged-in seeker
exports.getSavedJobs = async (req, res) => {
    try {
        const saved = await SavedJob.find({ user: req.user.id })
            .populate({
                path: 'job',
                populate: { path: 'postedBy', select: 'name' }
            })
            .sort('-savedAt');
        res.json(saved);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Add a job to saved list
exports.saveJob = async (req, res) => {
    try {
        const alreadySaved = await SavedJob.findOne({ user: req.user.id, job: req.params.id });
        if (alreadySaved) return res.status(400).json({ msg: 'Job already saved' });

        const newSaved = new SavedJob({ user: req.user.id, job: req.params.id });
        await newSaved.save();
        res.json(newSaved);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Remove a job from saved list
exports.removeSavedJob = async (req, res) => {
    try {
        await SavedJob.findOneAndDelete({ user: req.user.id, job: req.params.id });
        res.json({ msg: 'Job removed from bookmarks' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};