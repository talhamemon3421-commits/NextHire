const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    professionalHeadline: String,
    bio: String,
    profilePicture: { type: String, default: "" }, // URL to image
    socialLinks: {
        github: String,
        linkedin: String,
        portfolio: String
    },
    skills: [String],
    experience: [{
        title: String,
        company: String,
        duration: String,
        description: String
    }],
    education: [{
        school: String,
        degree: String,
        year: String
    }],
    certifications: [{
        name: String,
        organization: String
    }],
    isPublic: { type: Boolean, default: true },
    completionPercentage: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-calculate completion percentage before saving
ProfileSchema.pre('save', function(next) {
    let fields = [this.firstName, this.lastName, this.bio, this.professionalHeadline, this.profilePicture];
    let filled = fields.filter(f => f && f.length > 0).length;
    
    // Check arrays
    if (this.skills.length > 0) filled++;
    if (this.experience.length > 0) filled++;
    if (this.education.length > 0) filled++;
    
    this.completionPercentage = Math.round((filled / 8) * 100);
    next();
});

module.exports = mongoose.model('Profile', ProfileSchema);