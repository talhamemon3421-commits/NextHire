import mongoose from 'mongoose';

const { Schema, model, Types: { ObjectId } } = mongoose;

const jobSchema = new Schema({
  postedBy: { type: ObjectId, ref: 'User', required: true },

  title: { type: String, required: true, trim: true, minlength: 3 },

  description: {
    type: String,
    required: true,
    minlength: 20,
    maxlength: 5000
  },

  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true
  },

  location: { type: String, default: null },

  isRemote: { type: Boolean, default: false },

  isUrgent: { type: Boolean, default: false },

  salary: {
    min: { type: Number, min: 0, default: null },
    max: { type: Number, min: 0, default: null },
    currency: { type: String, enum: ['PKR', 'USD'], default: 'PKR' }
  },

  experienceLevel: {
    type: String,
    enum: ['entry', 'junior', 'mid', 'senior', 'lead'],
    required: true
  },

  responsibilities: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length <= 15;
      },
      message: 'Responsibilities cannot have more than 15 items'
    }
  },

  requirements: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length <= 15;
      },
      message: 'Requirements cannot have more than 15 items'
    }
  },

  benefits: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length <= 15;
      },
      message: 'Benefits cannot have more than 15 items'
    }
  },

  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function (v) {
        return Array.isArray(v) && v.length <= 15;
      },
      message: 'Skills cannot have more than 15 items'
    }
  },

  deadline: {
    type: Date,
    default: null,
    validate: {
      validator: function (v) {
        return !v || v > Date.now();
      },
      message: 'Deadline must be in the future'
    }
  },

  isActive: { type: Boolean, default: true },

  views: { type: Number, default: 0 }

}, { timestamps: true });

// Pre-validate hook — location & salary sanity checks
jobSchema.pre('validate', async function () {
  if (!this.isRemote && !this.location) {
    throw new Error('Non-remote jobs must have a location');
  }

  if (this.salary?.min != null && this.salary?.max != null) {
    if (this.salary.max < this.salary.min) {
      throw new Error('Max salary must be >= min salary');
    }
  }
});


// Indexes for performance
jobSchema.index({ postedBy: 1 });
jobSchema.index({ isActive: 1 });
jobSchema.index({ isUrgent: 1 });
jobSchema.index({ deadline: 1 });

// Statics for job operations
jobSchema.statics.createJob = async function (jobData) {
  const job = new this(jobData);
  return await job.save();
};

jobSchema.statics.getJobById = async function (jobId) {
  return await this.findByIdAndUpdate(
    jobId,
    { $inc: { views: 1 } },
    { new: true }
  ).populate('postedBy', 'name email');
};

jobSchema.statics.getJobsByEmployer = async function (employerId) {
  return await this.find({ postedBy: employerId })
    .select('-__v')
    .populate('postedBy', 'name email');
};

jobSchema.statics.getAllActiveJobs = async function () {
  return await this.find({ isActive: true })
    .select('-__v')
    .populate('postedBy', 'name email');
};

jobSchema.statics.deleteJob = async function (jobId) {
  return await this.findByIdAndDelete(jobId);
};

jobSchema.statics.updateJob = async function (jobId, updateData) {
  return await this.findByIdAndUpdate(jobId, updateData, {
    new: true,
    runValidators: true
  }).populate('postedBy', 'name email');
};

// Instance methods
jobSchema.methods.activateJob = async function () {
  this.isActive = true;
  return await this.save();
};

jobSchema.methods.deactivateJob = async function () {
  this.isActive = false;
  return await this.save();
};

jobSchema.methods.addRequirement = async function (requirement) {
  if (!requirement || typeof requirement !== 'string') {
    throw new Error('Requirement must be a non-empty string');
  }
  if (this.requirements.length >= 15) {
    throw new Error('Cannot add more than 15 requirements');
  }
  if (!this.requirements.includes(requirement)) {
    this.requirements.push(requirement);
    return await this.save();
  }
  return this;
};

jobSchema.methods.addBenefit = async function (benefit) {
  if (!benefit || typeof benefit !== 'string') {
    throw new Error('Benefit must be a non-empty string');
  }
  if (this.benefits.length >= 15) {
    throw new Error('Cannot add more than 15 benefits');
  }
  if (!this.benefits.includes(benefit)) {
    this.benefits.push(benefit);
    return await this.save();
  }
  return this;
};

jobSchema.methods.setDeadline = async function (deadline) {
  if (!deadline) throw new Error('Deadline is required');
  const deadlineDate = new Date(deadline);
  if (deadlineDate <= Date.now()) throw new Error('Deadline must be in the future');
  this.deadline = deadlineDate;
  return await this.save();
};

jobSchema.methods.extendDeadline = async function (daysToExtend) {
  if (!Number.isInteger(daysToExtend) || daysToExtend <= 0) {
    throw new Error('Days to extend must be a positive integer');
  }
  const newDeadline = new Date(this.deadline || Date.now());
  newDeadline.setDate(newDeadline.getDate() + daysToExtend);
  this.deadline = newDeadline;
  return await this.save();
};

jobSchema.methods.markAsUrgent = async function () {
  this.isUrgent = true;
  return await this.save();
};

jobSchema.methods.unmarkAsUrgent = async function () {
  this.isUrgent = false;
  return await this.save();
};

jobSchema.methods.incrementViews = async function () {
  this.views += 1;
  return await this.save();
};

jobSchema.methods.getViews = function () {
  return this.views;
};

jobSchema.methods.toJSON = function () {
  const jobObject = this.toObject();
  delete jobObject.__v;
  return jobObject;
};

const Job = model('Job', jobSchema);

export default Job;