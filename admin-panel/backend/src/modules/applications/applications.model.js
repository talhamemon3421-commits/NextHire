import mongoose from 'mongoose';

const { Schema, model, Types: { ObjectId } } = mongoose;

// ─── Constants ────────────────────────────────────────────────────────────────
export const APPLICATION_STATUSES = [
  'pending',
  'reviewing',
  'shortlisted',
  'interview',
  'offered',
  'accepted',
  'rejected',
  'withdrawn',
];

export const EMPLOYER_ALLOWED_STATUSES = [
  'reviewing',
  'shortlisted',
  'interview',
  'offered',
  'accepted',
  'rejected',
];

// ─── Schema ───────────────────────────────────────────────────────────────────
const applicationSchema = new Schema(
  {
    job: { type: ObjectId, ref: 'Job', required: true },
    applicant: { type: ObjectId, ref: 'User', required: true },

    coverLetter: { type: String, maxlength: 2000, default: null },

    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'pending',
    },

    statusHistory: [
      {
        status: { type: String, enum: APPLICATION_STATUSES },
        changedBy: { type: ObjectId, ref: 'User' },
        note: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    interview: {
      date: { type: Date, default: null },
      link: { type: String, default: null },
    },

    hiringNotes: { type: String, maxlength: 2000, default: null },

    withdrawnAt: { type: Date, default: null },
    withdrawReason: { type: String, default: null },
    isWithdrawn: { type: Boolean, default: false },

    chatRoom: { type: ObjectId, ref: 'ChatRoom', default: null },
  },
  { timestamps: true }
);

// ─── Middleware / Hooks ───────────────────────────────────────────────────────
applicationSchema.pre('save', async function () {
  if (this.isNew) {
    try {
      const Job = mongoose.model('Job');
      await Job.findByIdAndUpdate(this.job, { $inc: { applicationCount: 1 } });
    } catch (error) {
      console.error('Error incrementing applicationCount on Job:', error);
    }
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// ─── Statics ──────────────────────────────────────────────────────────────────
applicationSchema.statics.getApplicationsByJob = async function (
  jobId,
  { status, page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = {}
) {
  const filter = { job: jobId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const [applications, total] = await Promise.all([
    this.find(filter)
      .populate('applicant', 'name email profilePicture')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(filter),
  ]);

  return { applications, total, page, limit, totalPages: Math.ceil(total / limit) };
};

applicationSchema.statics.getApplicationForEmployer = async function (
  applicationId,
  employerId
) {
  const application = await this.findById(applicationId)
    .populate('applicant', 'name email profilePicture phone location skills bio linkedIn github portfolio')
    .populate('job', 'title postedBy')
    .populate('statusHistory.changedBy', 'name')
    .lean();

  if (!application) return null;
  if (application.job.postedBy.toString() !== employerId.toString()) return null;

  return application;
};

applicationSchema.statics.updateStatus = async function (
  applicationId,
  newStatus,
  changedBy,
  note = null
) {
  const application = await this.findById(applicationId);
  if (!application) return null;

  application.status = newStatus;
  application.statusHistory.push({ status: newStatus, changedBy, note });

  return await application.save();
};

applicationSchema.statics.scheduleInterview = async function (
  applicationId,
  { date, link },
  changedBy
) {
  const application = await this.findById(applicationId);
  if (!application) return null;

  application.interview = { date, link };

  if (application.status !== 'interview') {
    application.status = 'interview';
    application.statusHistory.push({
      status: 'interview',
      changedBy,
      note: 'Interview scheduled',
    });
  }

  return await application.save();
};

applicationSchema.statics.updateHiringNotes = async function (
  applicationId,
  hiringNotes
) {
  return await this.findByIdAndUpdate(
    applicationId,
    { hiringNotes },
    { new: true, runValidators: true }
  );
};

applicationSchema.statics.getStatusStats = async function (jobId) {
  const stats = await this.aggregate([
    { $match: { job: new ObjectId(jobId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return stats.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});
};

applicationSchema.statics.getEmployerStats = async function (employerId) {
  return await this.aggregate([
    {
      $lookup: {
        from: 'jobs',
        localField: 'job',
        foreignField: '_id',
        as: 'jobDoc',
      },
    },
    { $unwind: '$jobDoc' },
    { $match: { 'jobDoc.postedBy': new ObjectId(employerId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
};

// ─── Model ────────────────────────────────────────────────────────────────────
const Application = model('Application', applicationSchema);
export default Application;