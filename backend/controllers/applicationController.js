const { Resume, Application, Job, Notification } = require('../models/User');

// --- RESUME MANAGEMENT ---

exports.uploadResume = async (req, res) => {
    try {
        const { fileName, fileUrl, label } = req.body;
        const newResume = new Resume({
            owner: req.user.id,
            fileName,
            fileUrl,
            label: label || 'My Resume',
            fileType: 'application/pdf'
        });
        await newResume.save();
        res.status(201).json(newResume);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getUserResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ owner: req.user.id, isDeleted: false });
        res.json(resumes);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// --- APPLICATION LOGIC ---

exports.applyToJob = async (req, res) => {
    try {
        const { jobId, resumeId, coverLetter } = req.body;

        // Check if already applied
        const existing = await Application.findOne({ job: jobId, applicant: req.user.id });
        if (existing) return res.status(400).json({ msg: 'Already applied for this job' });

        const newApplication = new Application({
            job: jobId,
            applicant: req.user.id,
            resume: resumeId,
            coverLetter,
            status: 'pending', // Default per schema [cite: 167]
            statusHistory: [{ status: 'pending', changedBy: req.user.id }]
        });

        await newApplication.save();

        // Optional: Trigger Notification for Employer [cite: 202]
        res.status(201).json(newApplication);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.withdrawApplication = async (req, res) => {
    try {
        const { reason } = req.body;
        const application = await Application.findOneAndUpdate(
            { _id: req.params.id, applicant: req.user.id },
            { 
                isWithdrawn: true, 
                withdrawnAt: Date.now(), 
                withdrawReason: reason,
                status: 'withdrawn' 
            },
            { new: true }
        );
        res.json(application);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getMyApplications = async (req, res) => {
    try {
        const apps = await Application.find({ applicant: req.user.id })
            .populate({
                path: 'job',
                select: 'title location salary isRemote',
                populate: { path: 'postedBy', select: 'name' }
            })
            .sort('-createdAt'); 
        res.json(apps);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.applyToJob = async (req, res) => {
    try {
        const { jobId, resumeId } = req.body;
        const newApp = new Application({
            job: jobId,
            applicant: req.user.id,
            resume: resumeId,
            status: 'pending' // Default status per schema [cite: 167]
        });
        await newApp.save();
        res.status(201).json(newApp);
    } catch (err) {
        res.status(500).send('Application failed');
    }
};