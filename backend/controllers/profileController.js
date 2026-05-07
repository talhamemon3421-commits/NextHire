const Profile = require('../models/Profile');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        // Find by the user ID attached to the token
        const profile = await Profile.findOne({ user: req.user.id });
        
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Create or Update profile
exports.updateProfile = async (req, res) => {
    try {
        // We include req.user.id to ensure the profile belongs to the logged-in job seeker
        const profileFields = {
            ...req.body,
            user: req.user.id 
        };

        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};